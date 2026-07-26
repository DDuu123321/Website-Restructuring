/**
 * Email transport — Zoho SMTP via Nodemailer.
 *
 * Loaded by every lead-collection's afterChange hook
 * (sendQuoteEmails / sendAssessmentEmails) and by
 * the customer-confirmation send in the quote/assessment hooks.
 *
 * IMPORTANT: nodemailer is loaded via `eval('require')` so the Payload
 * admin's webpack bundler can't statically follow the import chain
 * into nodemailer (whose Node-only deps — fs/net/tls/stream/... —
 * otherwise crash the admin SPA at module-load time).
 *
 * Env vars required:
 *   SMTP_HOST  e.g. smtp.zoho.com (worldwide) or smtp.zoho.com.au (AU region)
 *   SMTP_PORT  465 (SSL, recommended) or 587 (STARTTLS)
 *   SMTP_USER  the full Zoho email address (e.g. system@bluven.com.au)
 *   SMTP_PASS  a Zoho APP PASSWORD — NOT the account login password.
 *              Generate at: zoho.com/mail → Settings → Security → App Passwords
 *   EMAIL_FROM optional override of the From: header. Defaults to SMTP_USER
 *              so the From and the authenticated sender always match
 *              (Zoho rejects mismatches as anti-spoofing).
 */

import type { Transporter } from 'nodemailer'   // ← type-only, erased at runtime

let _transporter: Transporter | null = null

/**
 * Late-bind nodemailer at runtime. Using `eval('require')` rather than
 * a static `import` or static `require` keeps webpack's dependency
 * graph blind to it — admin SPA bundle stays clean of Node deps.
 */
function loadNodemailer(): any {
  // eslint-disable-next-line no-eval
  return eval("require")('nodemailer')
}

function getTransporter(): Transporter {
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST || 'smtp.zoho.com'
  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''

  const nodemailer = loadNodemailer()
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,     // 465 → implicit TLS; 587 → STARTTLS upgrade
    auth: user && pass ? { user, pass } : undefined,
    // Without these, nodemailer waits ~2 minutes on a blackholed connection
    // (e.g. Railway's trial plan drops SMTP egress silently). Callers no longer
    // block API responses on mail, but a dead SMTP host still shouldn't pin
    // sockets and promises for minutes at a time.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })

  return _transporter!
}

export interface SendMailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendMail(opts: SendMailOptions): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@bluven.com.au'

  // HTTPS relay mode: Railway blackholes outbound SMTP at the account level
  // (verified: the same Zoho credentials connect fine from anywhere else), so
  // when MAIL_RELAY_URL is set the mail is handed to our own Next.js API route
  // on Netlify — whose AWS egress can reach Zoho — instead of dialling SMTP
  // from here. Unset the variable to go back to direct SMTP.
  const relayUrl = process.env.MAIL_RELAY_URL
  if (relayUrl) {
    const res = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-relay-key': process.env.MAIL_RELAY_KEY || '',
      },
      body: JSON.stringify({ to: opts.to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo, from }),
      signal: AbortSignal.timeout(25_000),
    })
    if (!res.ok) {
      throw new Error(`mail relay responded ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
    }
    return
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP_USER / SMTP_PASS not set — skipping email send.')
    return
  }

  await getTransporter().sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  })
}

export function notifyEmail(override?: string): string {
  return override || process.env.NOTIFY_EMAIL || process.env.SMTP_USER || 'info@bluven.com.au'
}

/**
 * Escape user-supplied values before interpolating them into HTML emails.
 * Lead fields (notes, names, review text, quiz output…) are attacker-controlled;
 * without this, a submitted `<img onerror>` / `<script>` runs in the recipient's
 * mail client. Apply to every dynamic leaf value in an email template — NOT to
 * our own surrounding markup. Returns '' for null/undefined.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
