import { sendMail, escapeHtml as esc } from '../lib/mailer'

/**
 * Issue types offered on the /support form. Lives here (not in the collection
 * file) so the email template can label the stored value without a circular
 * import — the collection already imports this hook.
 *
 * Postgres enums only grow at the end: append new types, never reorder.
 */
export const SUPPORT_ISSUE_TYPES = [
  { label: 'System not producing',              value: 'no-production' },
  { label: 'Inverter fault or error code',       value: 'inverter-fault' },
  { label: 'Battery issue',                      value: 'battery' },
  { label: 'App or monitoring offline',          value: 'monitoring' },
  { label: 'EV charger issue',                   value: 'ev-charger' },
  { label: 'Warranty claim',                     value: 'warranty' },
  { label: 'Installation or delivery follow-up', value: 'delivery' },
  { label: 'Other',                              value: 'other' },
] as const

export type SupportIssueType = typeof SUPPORT_ISSUE_TYPES[number]['value']

/** Delivery follow-ups belong to the operations team; everything else is technical. */
export const OPERATIONS_ISSUE_TYPES: readonly SupportIssueType[] = ['delivery']

function issueLabel(value: unknown): string {
  return SUPPORT_ISSUE_TYPES.find((t) => t.value === value)?.label || String(value || 'Other')
}

export interface SupportRoutes {
  support: string
  operations: string
}

/**
 * `internalOn` gates ONLY the team notification (the admin toggle's documented
 * meaning). The customer confirmation always goes out — the /support success
 * page promises it, and its Reply-To is the team inbox so the customer can
 * answer with photos or more detail without a second form.
 */
export async function sendSupportEmails(doc: any, routes: SupportRoutes, internalOn = true) {
  const teamInbox = OPERATIONS_ISSUE_TYPES.includes(doc.issueType) ? routes.operations : routes.support
  const name = `${doc.firstName || ''} ${doc.lastName || ''}`.trim()
  const location = [doc.address, doc.state, doc.postcode].filter(Boolean).join(', ')
  const issue = issueLabel(doc.issueType)

  // ── 1. Notify the team ──────────────────────────────────
  if (internalOn) try {
    await sendMail({
      to: teamInbox,
      replyTo: doc.email,
      subject: `🛠 Support request — ${name} · ${issue}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0a1628;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;font-size:20px">New Support Request</h2>
            <p style="margin:4px 0 0;opacity:.7;font-size:14px">Submitted via bluven.com.au/support</p>
          </div>
          <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">

            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Customer</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:6px 0;color:#6b7280;width:140px;font-size:14px">Name</td><td style="font-weight:600;font-size:14px">${esc(name)}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Email</td><td style="font-size:14px"><a href="mailto:${esc(doc.email)}" style="color:#d97706">${esc(doc.email)}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Phone</td><td style="font-size:14px"><a href="tel:${esc(doc.phone)}" style="color:#d97706">${esc(doc.phone)}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Site address</td><td style="font-size:14px">${esc(location) || '—'}</td></tr>
            </table>

            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Issue</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:6px 0;color:#6b7280;width:140px;font-size:14px">Type</td><td style="font-weight:600;font-size:14px;color:#d97706">${esc(issue)}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Product</td><td style="font-size:14px">${esc(doc.product) || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Installed</td><td style="font-size:14px">${esc(doc.installedWhen) || '—'}</td></tr>
            </table>

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:16px;font-size:14px;color:#374151;white-space:pre-wrap">${esc(doc.description)}</div>

            <p style="font-size:13px;color:#6b7280;margin:0 0 16px">Reply to this email to answer the customer directly.</p>

            <a href="${process.env.SERVER_URL}/admin/collections/support-requests/${doc.id}"
               style="display:inline-block;background:#d97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
              View in Admin Panel →
            </a>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send support team notification:', err)
  }

  // ── 2. Confirm to the customer ──────────────────────────
  if (!doc.email) return
  try {
    await sendMail({
      to: doc.email,
      replyTo: teamInbox,
      subject: `Thanks ${doc.firstName || 'there'} — we've received your support request`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0a1628;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;font-size:22px">Thanks, ${esc(doc.firstName) || 'there'}!</h2>
            <p style="margin:6px 0 0;opacity:.75;font-size:15px">We've received your support request.</p>
          </div>
          <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
            <p style="font-size:15px;color:#374151;line-height:1.6">
              Our team has your details and will be in touch by email.
              If you have photos of the issue, an error code or anything else that helps,
              simply <strong>reply to this email</strong> — it goes straight to the team handling your request.
            </p>

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
              <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af">Your request</h3>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:5px 0;color:#6b7280;width:140px;font-size:13px">Issue</td><td style="font-size:13px;font-weight:600">${esc(issue)}</td></tr>
                ${doc.product ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px">Product</td><td style="font-size:13px">${esc(doc.product)}</td></tr>` : ''}
                <tr><td style="padding:5px 0;color:#6b7280;font-size:13px">Site</td><td style="font-size:13px">${esc(location) || '—'}</td></tr>
              </table>
              <p style="margin:14px 0 0;font-size:13px;color:#374151;white-space:pre-wrap">${esc(doc.description)}</p>
            </div>

            <p style="font-size:13px;color:#9ca3af">Bluven Energy Pty Ltd · CEC Approved Retailer</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send support confirmation:', err)
  }
}
