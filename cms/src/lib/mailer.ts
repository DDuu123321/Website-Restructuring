/**
 * Email transport — Zoho SMTP via Nodemailer.
 *
 * Loaded by every lead-collection's afterChange hook
 * (sendQuoteEmails / sendAssessmentEmails / sendReviewEmail) and by
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

export function notifyEmail(): string {
  return process.env.NOTIFY_EMAIL || process.env.SMTP_USER || 'info@bluven.com.au'
}
