import { NextResponse } from 'next/server'
import { timingSafeEqual, createHash } from 'crypto'
import nodemailer from 'nodemailer'

/**
 * Outbound-mail relay for the CMS.
 *
 * Railway blackholes outbound SMTP for our account (ETIMEDOUT at CONN on 465
 * and 587, while the same Zoho credentials send fine from any other network),
 * so the CMS posts mail here — this route runs in Netlify's AWS environment,
 * whose egress reaches Zoho normally — instead of dialling SMTP itself.
 *
 * Auth is a shared secret: the CMS sends x-relay-key, which must match
 * MAIL_RELAY_KEY configured on Netlify. Without the header (or with the env
 * var unset) every request is rejected, so the route is inert unless both
 * sides are configured.
 *
 * Hardening: the sender identity is fixed server-side (a caller cannot choose
 * who the mail claims to be from), the key comparison is constant-time, and
 * recipient/size limits keep a leaked key from turning this into a bulk
 * spam cannon.
 */

const MAX_SUBJECT = 300
const MAX_HTML = 200_000
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/

/** Constant-time compare over digests so length never leaks. */
function keyMatches(provided: string | null, expected: string): boolean {
  const a = createHash('sha256').update(provided ?? '').digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const expected = process.env.MAIL_RELAY_KEY
  if (!expected || !keyMatches(req.headers.get('x-relay-key'), expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { to, subject, html, replyTo } = (body || {}) as Record<string, unknown>

  // `from` is deliberately NOT read from the request: a caller must not be
  // able to make Bluven-authenticated mail claim an arbitrary sender.
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER

  if (typeof to !== 'string' || !EMAIL_RE.test(to.trim())) {
    return NextResponse.json({ error: 'a single valid "to" address is required' }, { status: 400 })
  }
  if (typeof subject !== 'string' || !subject.trim() || subject.length > MAX_SUBJECT) {
    return NextResponse.json({ error: 'subject is required (max 300 chars)' }, { status: 400 })
  }
  if (typeof html !== 'string' || !html || html.length > MAX_HTML) {
    return NextResponse.json({ error: 'html is required (max 200k chars)' }, { status: 400 })
  }
  const replyToAddr =
    typeof replyTo === 'string' && EMAIL_RE.test(replyTo.trim()) ? replyTo.trim() : undefined

  const port = Number(process.env.SMTP_PORT || 465)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER as string, pass: process.env.SMTP_PASS as string },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })

  try {
    await transporter.sendMail({
      from,
      to: to.trim(),
      subject,
      html,
      replyTo: replyToAddr,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[send-mail] relay send failed:', err?.code, err?.message)
    return NextResponse.json({ error: 'send failed' }, { status: 502 })
  }
}
