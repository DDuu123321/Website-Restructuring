/**
 * Email transport — Zoho SMTP via Nodemailer.
 *
 * Replaces the earlier Resend-based mailer. All three lead hooks
 * (sendQuoteEmails / sendAssessmentEmails / sendReviewEmail) go through
 * `sendMail()` so the SMTP config lives in one place.
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

import nodemailer, { type Transporter } from 'nodemailer'

let _transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST || 'smtp.zoho.com'
  const port = parseInt(process.env.SMTP_PORT || '465', 10)
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,     // 465 → implicit TLS; 587 → STARTTLS upgrade
    auth: user && pass ? { user, pass } : undefined,
  })

  return _transporter
}

export interface SendMailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendMail(opts: SendMailOptions): Promise<void> {
  // Zoho requires the From address to match the authenticated SMTP_USER
  // (otherwise it returns "Authentication required to send mail from this
  // address"). Default to SMTP_USER for safety; override only if you've
  // configured an alias under the same Zoho account.
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@bluven.com.au'

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // No SMTP creds → don't crash, just log. Lead is still saved in CMS.
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
