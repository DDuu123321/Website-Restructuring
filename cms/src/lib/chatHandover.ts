/**
 * Sunny hand-over pipeline.
 *
 * Sunny ends a conversation that needs a person with a trailing
 * `##HANDOVER##{json}` line (contract: lib/sunnyPrompt.ts). This module
 *   1. strips that marker out of the visible reply,
 *   2. stores the conversation transcript on every turn (hand-over or not),
 *   3. on a hand-over: saves the summary/keywords, creates a Quote for new
 *      enquiries, and emails the summary + transcript to the owning team.
 *
 * Everything the model emits is untrusted: fields are length-capped, the type
 * can only select one of three fixed inboxes, and all values are HTML-escaped
 * in the email.
 */
import type { Payload } from 'payload'
import { sendMail, escapeHtml as esc } from './mailer'

const MARKERS = ['##HANDOVER##', '##LEAD##']   // ##LEAD## = pre-2026-11 marker, kept so a stale reply never leaks to the visitor
const CONVERSATION_ID_RE = /^[A-Za-z0-9-]{8,64}$/
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/
const STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT']

export type HandoverType = 'new_enquiry' | 'existing_order' | 'service' | 'other'
export type HandoverPriority = 'urgent' | 'high' | 'normal'

const TYPE_LABEL: Record<HandoverType, string> = {
  new_enquiry: 'New enquiry',
  existing_order: 'Existing order',
  service: 'After-sales',
  other: 'General enquiry',
}
const INTEREST_MAP: Record<string, string[]> = {
  solar: ['Solar'], battery: ['Battery'], ev: ['EV'], multiple: ['Solar', 'Battery'],
}

export interface Handover {
  type: HandoverType
  priority: HandoverPriority
  name: string
  phone: string
  email: string
  address: string
  suburb: string
  state: string
  postcode: string
  interest: string
  request: string
  keywords: string[]
  summary: string
  details: Record<string, string>
  missing: string[]
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

const str = (v: unknown, max: number) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim().slice(0, max) : '')
const list = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : []

function normalise(raw: any): Handover | null {
  if (!raw || typeof raw !== 'object') return null
  const type = (['new_enquiry', 'existing_order', 'service', 'other'] as const).find((t) => t === raw.type) || 'other'
  const priority = (['urgent', 'high', 'normal'] as const).find((p) => p === raw.priority) || 'normal'
  const details: Record<string, string> = {}
  if (raw.details && typeof raw.details === 'object' && !Array.isArray(raw.details)) {
    for (const [k, v] of Object.entries(raw.details).slice(0, 40)) {
      const val = str(v, 500)
      if (val) details[str(k, 60)] = val
    }
  }
  const email = str(raw.email, 200)
  const h: Handover = {
    type, priority,
    name: str(raw.name, 120),
    phone: str(raw.phone, 40),
    email: EMAIL_RE.test(email) ? email : '',
    address: str(raw.address, 200),
    suburb: str(raw.suburb, 100),
    state: str(raw.state, 10).toUpperCase(),
    postcode: str(raw.postcode, 10),
    interest: str(raw.interest, 20).toLowerCase(),
    request: str(raw.request, 200),
    keywords: list(raw.keywords, 10, 60),
    summary: str(raw.summary, 2000),
    details,
    missing: list(raw.missing, 20, 100),
  }
  // A hand-over nobody can act on is not a hand-over: need a way to reach the
  // visitor and something to tell the team.
  if (!(h.phone || h.email) || !(h.summary || h.request)) return null
  return h
}

/** Split Sunny's raw output into the visitor-facing reply and the hand-over (if any). */
export function extractHandover(text: string): { reply: string; handover: Handover | null } {
  const hit = MARKERS.map((m) => ({ m, idx: text.indexOf(m) })).filter((x) => x.idx !== -1).sort((a, b) => a.idx - b.idx)[0]
  if (!hit) return { reply: text, handover: null }
  const reply = text.slice(0, hit.idx).trim()
  let handover: Handover | null = null
  if (hit.m === '##HANDOVER##') {
    try {
      const m = text.slice(hit.idx + hit.m.length).match(/\{[\s\S]*\}/)
      if (m) handover = normalise(JSON.parse(m[0]))
    } catch { /* malformed marker → store the transcript, hand nothing over */ }
  }
  return { reply: reply || "All set — I've passed this to our team and they'll be in touch.", handover }
}

export const isConversationId = (v: unknown): v is string => typeof v === 'string' && CONVERSATION_ID_RE.test(v)

function transcriptText(messages: ChatMessage[], reply: string): string {
  return [...messages, { role: 'assistant' as const, content: reply }]
    .map((m) => `${m.role === 'user' ? 'Customer' : 'Sunny'}: ${m.content}`)
    .join('\n\n')
}

/** New enquiries keep feeding the sales pipeline (Quotes → CRM sync) exactly as the old ##LEAD## flow did. */
function quoteData(h: Handover) {
  const [firstName, ...rest] = (h.name || 'Website visitor').split(/\s+/)
  return {
    firstName,
    lastName: rest.join(' ') || undefined,
    phone: h.phone,
    email: h.email || undefined,
    address: h.address || undefined,
    suburb: h.suburb || undefined,
    state: STATES.includes(h.state) ? h.state : undefined,
    postcode: /^\d{4}$/.test(h.postcode) ? h.postcode : undefined,
    components: INTEREST_MAP[h.interest],
    notes: [
      'Lead captured by Sunny (AI chat).',
      h.request ? `Request: ${h.request}.` : '',
      h.summary,
      h.keywords.length ? `Keywords: ${h.keywords.join(', ')}.` : '',
    ].filter(Boolean).join('\n').slice(0, 5000),
    source: { referrer: 'ai-chat' },
  }
}

async function sendHandoverEmail(opts: {
  to: string; h: Handover; transcript: string; docId: number | string; isUpdate: boolean; quoteId?: number | string
}) {
  const { to, h, transcript, docId, isUpdate, quoteId } = opts
  const where = [h.suburb, h.state, h.postcode].filter(Boolean).join(' ')
  const priority = h.priority.charAt(0).toUpperCase() + h.priority.slice(1)
  const subject = `${isUpdate ? '[Update] ' : ''}[${TYPE_LABEL[h.type]}] [${priority}] ${h.name || 'Website visitor'}${where ? `, ${where}` : ''}: ${h.request || 'chat hand-over'}`.slice(0, 280)
  const row = (k: string, v: string) =>
    v ? `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;width:150px;font-size:14px;vertical-align:top">${esc(k)}</td><td style="font-size:14px">${esc(v)}</td></tr>` : ''
  const badge = h.priority === 'urgent' ? '#dc2626' : h.priority === 'high' ? '#d97706' : '#6b7280'

  await sendMail({
    to,
    replyTo: h.email || undefined,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto">
        <div style="background:#0a1628;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;font-size:20px">${esc(TYPE_LABEL[h.type])} from the AI chat${isUpdate ? ' (updated)' : ''}</h2>
          <p style="margin:6px 0 0;font-size:13px"><span style="background:${badge};color:#fff;padding:2px 10px;border-radius:999px;font-weight:700">${esc(priority)} priority</span></p>
        </div>
        <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">

          <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">What the customer needs</h3>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:12px;font-size:15px;line-height:1.55;color:#111827">${esc(h.summary || h.request)}</div>
          ${h.keywords.length ? `<p style="margin:0 0 20px;font-size:13px;color:#374151"><b>Keywords:</b> ${esc(h.keywords.join(' · '))}</p>` : ''}

          <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Customer</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            ${row('Name', h.name)}
            ${row('Phone', h.phone)}
            ${row('Email', h.email)}
            ${row('Address', [h.address, where].filter(Boolean).join(', '))}
            ${row('Request', h.request)}
          </table>

          ${Object.keys(h.details).length ? `
          <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Details collected</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            ${Object.entries(h.details).map(([k, v]) => row(k.replace(/_/g, ' '), v)).join('')}
          </table>` : ''}

          ${h.missing.length ? `<p style="margin:0 0 20px;font-size:13px;color:#b45309"><b>Still missing:</b> ${esc(h.missing.join(', '))}</p>` : ''}

          <h3 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Full conversation</h3>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.5;color:#374151;white-space:pre-wrap">${esc(transcript)}</div>

          <p style="font-size:13px;color:#6b7280;margin:0 0 16px">${h.email ? 'Reply to this email to answer the customer directly.' : 'The customer left no email address — call them.'}${quoteId ? ` A quote record (#${esc(quoteId)}) was created.` : ''}</p>
          <a href="${process.env.SERVER_URL}/admin/collections/chat-conversations/${docId}"
             style="display:inline-block;background:#d97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
            View in Admin Panel →
          </a>
        </div>
      </div>
    `,
  })
}

/**
 * The chat endpoint is stateless and the marker is stripped from what the
 * visitor's browser keeps, so on later turns the model cannot see that it has
 * already handed the case over — against the real model it re-sent the
 * hand-over on every following turn (five emails for one enquiry). The
 * endpoint appends this note to the system prompt once a conversation has been
 * handed over.
 */
export const ALREADY_HANDED_OVER_NOTE = `

STATE OF THIS CONVERSATION: it has ALREADY been handed over to the team — the ##HANDOVER## marker was sent on an earlier turn. Do NOT output the marker again, unless the visitor has since given substantial new facts (new contact details, equipment details, a new problem, or a safety issue); in that case send the complete, updated JSON once. For thanks, goodbyes, confirmations or small talk, just reply normally with no marker.`

export async function isHandedOver(payload: Payload, conversationId: unknown): Promise<boolean> {
  if (!isConversationId(conversationId)) return false
  try {
    const found = await payload.find({
      collection: 'chat-conversations' as any,
      where: { conversationId: { equals: conversationId } },
      limit: 1, depth: 0,
    })
    const doc: any = found.docs[0]
    return !!doc && doc.status !== 'open'
  } catch { return false }
}

/** Does a repeat hand-over tell the team anything the first email did not? */
function addsNewFacts(existing: any, h: Handover): boolean {
  const rank = { normal: 0, high: 1, urgent: 2 } as Record<string, number>
  if ((rank[h.priority] ?? 0) > (rank[existing.priority] ?? 0)) return true
  if (h.type !== existing.type) return true
  if ((h.phone && h.phone !== existing.customerPhone) || (h.email && h.email !== existing.customerEmail)) return true
  const before = existing.details && typeof existing.details === 'object' ? existing.details : {}
  return Object.entries(h.details).some(([k, v]) => v && !before[k])
}

/**
 * Persist one chat turn. Called fire-and-forget after the reply is sent, so a
 * slow database or mail relay never delays the visitor.
 */
export async function recordChatTurn(payload: Payload, opts: {
  conversationId: unknown; messages: ChatMessage[]; reply: string; handover: Handover | null
}): Promise<void> {
  const { messages, reply, handover } = opts
  // Old cached frontends send no id: still honour a hand-over, skip plain logging.
  if (!isConversationId(opts.conversationId) && !handover) return
  const conversationId = isConversationId(opts.conversationId)
    ? opts.conversationId
    : `noid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

  const transcript = transcriptText(messages, reply)
  const found = await payload.find({
    collection: 'chat-conversations' as any,
    where: { conversationId: { equals: conversationId } },
    limit: 1, depth: 0,
  })
  const existing: any = found.docs[0]
  const data: Record<string, unknown> = { conversationId, transcript, messageCount: messages.length + 1 }

  let settings: any = null
  let to = ''
  let quoteId: number | string | undefined = existing?.quoteId || undefined
  if (handover) {
    try { settings = await payload.findGlobal({ slug: 'site-settings' }) } catch { /* defaults */ }
    to = handover.type === 'service' ? settings?.supportEmail || 'support@bluven.com.au'
      : handover.type === 'existing_order' ? settings?.operationsEmail || 'operations@bluven.com.au'
      : settings?.quoteEmail || 'info@bluven.com.au'

    if (handover.type === 'new_enquiry' && handover.phone && !quoteId) {
      try {
        // skipNotifications: the hand-over email below already tells sales,
        // with far more context than the generic quote notification.
        const quote: any = await payload.create({
          collection: 'quotes',
          data: quoteData(handover) as any,
          context: { skipNotifications: true },
        })
        quoteId = quote.id
      } catch (e: any) {
        // e.g. a phone number that fails AU validation — the hand-over still goes out.
        payload.logger.warn(`[chat] quote not created from hand-over: ${e?.message || e}`)
      }
    }

    Object.assign(data, {
      status: settings?.notifications?.adminOnChat === false ? 'reviewed' : 'new',
      type: handover.type,
      priority: handover.priority,
      routedTo: to,
      quoteId,
      summary: handover.summary,
      request: handover.request,
      keywords: handover.keywords.join(', '),
      missing: handover.missing.join(', '),
      customerName: handover.name,
      customerPhone: handover.phone,
      customerEmail: handover.email,
      postcode: handover.postcode,
      details: { ...handover.details, address: handover.address, suburb: handover.suburb, state: handover.state, interest: handover.interest },
    })
  }

  const doc: any = existing
    ? await payload.update({ collection: 'chat-conversations' as any, id: existing.id, data: data as any })
    : await payload.create({ collection: 'chat-conversations' as any, data: data as any })

  // A repeat hand-over always refreshes the stored record, but only earns a
  // second email when it carries something the team has not been told.
  const isUpdate = !!existing && existing.status !== 'open'
  if (handover && settings?.notifications?.emailOnChat !== false && (!isUpdate || addsNewFacts(existing, handover))) {
    await sendHandoverEmail({ to, h: handover, transcript, docId: doc.id, quoteId, isUpdate })
  }
}
