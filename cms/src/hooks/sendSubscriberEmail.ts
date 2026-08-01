import { sendMail, notifyEmail, escapeHtml as esc } from '../lib/mailer'

/**
 * Internal heads-up when someone joins the newsletter list. Subscribers are
 * the quiet lead channel — no reply is expected, so there is no customer
 * confirmation email, just this one note to the business inbox.
 */
export async function sendSubscriberEmail(doc: any, notifyTo?: string) {
  await sendMail({
    to: notifyEmail(notifyTo),
    subject: `📰 New newsletter subscriber — ${doc.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0a1628;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;font-size:20px">New Newsletter Subscriber</h2>
          <p style="margin:4px 0 0;opacity:.7;font-size:14px">Signed up via bluven.com.au</p>
        </div>
        <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:6px 0;color:#6b7280;width:140px;font-size:14px">Email</td><td style="font-weight:600;font-size:14px"><a href="mailto:${esc(doc.email)}" style="color:#d97706">${esc(doc.email)}</a></td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Source</td><td style="font-size:14px">${esc(doc.source) || 'news-page'}</td></tr>
          </table>
          <a href="${process.env.SERVER_URL}/admin/collections/subscribers"
             style="display:inline-block;background:#d97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
            View subscriber list →
          </a>
        </div>
      </div>
    `,
  })
}
