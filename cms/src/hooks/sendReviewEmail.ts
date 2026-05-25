import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}

const FROM = () => process.env.EMAIL_FROM || 'noreply@bluven.com.au'
const NOTIFY = () => process.env.NOTIFY_EMAIL || 'info@bluven.com.au'

export async function sendReviewEmail(doc: any) {
  const stars = '★'.repeat(parseInt(doc.rating, 10) || 5)
  const name = doc.customerName || 'Anonymous'

  try {
    await getResend().emails.send({
      from: FROM(),
      to: NOTIFY(),
      subject: `💬 New review — ${doc.rating || 5}⭐ from ${name} (${doc.suburb || '?'})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#042744;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;font-size:20px">New customer review</h2>
            <p style="margin:4px 0 0;opacity:.75;font-size:14px">Auto-published on bluven.com.au</p>
          </div>
          <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:18px">
              <div style="font-size:24px;color:#d97706;letter-spacing:2px;margin-bottom:8px">${stars}</div>
              <div style="font-size:18px;font-weight:800;color:#042744">${name}</div>
              <div style="font-size:13px;color:#6b7280;margin-bottom:14px">${doc.suburb || ''}</div>
              <blockquote style="margin:0;padding:14px 16px;background:#f9fafb;border-left:3px solid #ffc61f;font-size:14.5px;color:#374151;line-height:1.6;font-style:italic">
                ${(doc.review || '').replace(/</g, '&lt;').replace(/\n/g, '<br>')}
              </blockquote>
              ${doc.systemInstalled ? `<div style="margin-top:14px;font-size:13px;color:#6b7280"><b style="color:#042744">System:</b> ${doc.systemInstalled}</div>` : ''}
            </div>

            <p style="font-size:14px;color:#374151;line-height:1.6">
              This review is <b>already live</b> on the website. Open the admin to pin it to the homepage, mark as reviewed, or hide it.
            </p>

            <a href="${process.env.SERVER_URL}/admin/collections/testimonials/${doc.id}"
               style="display:inline-block;margin-top:8px;background:#d97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
              Manage in Admin →
            </a>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send review notification:', err)
  }
}
