import { sendMail, notifyEmail } from '../lib/mailer'

const NOTIFY = () => notifyEmail()

function fmtComponents(c: string[] | undefined) {
  if (!Array.isArray(c) || c.length === 0) return 'Not specified'
  return c.join(', ')
}

export async function sendQuoteEmails(doc: any) {
  const name = `${doc.firstName || ''} ${doc.lastName || ''}`.trim()
  const location = [doc.suburb, doc.state, doc.postcode].filter(Boolean).join(' ')

  // ── 1. Notify the business ──────────────────────────────
  try {
    await sendMail({
      to: NOTIFY(),
      replyTo: doc.email,
      subject: `🔆 New Quote Request — ${name} (${doc.state || '?'})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0a1628;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;font-size:20px">New Quote Request</h2>
            <p style="margin:4px 0 0;opacity:.7;font-size:14px">Submitted via bluven.com.au</p>
          </div>
          <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">

            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Contact</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:6px 0;color:#6b7280;width:140px;font-size:14px">Name</td><td style="font-weight:600;font-size:14px">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Email</td><td style="font-size:14px"><a href="mailto:${doc.email}" style="color:#d97706">${doc.email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Phone</td><td style="font-size:14px"><a href="tel:${doc.phone}" style="color:#d97706">${doc.phone}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Best time</td><td style="font-size:14px">${doc.bestTime || 'Anytime'}</td></tr>
            </table>

            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Property & Location</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:6px 0;color:#6b7280;width:140px;font-size:14px">Property type</td><td style="font-size:14px">${doc.propertyType || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Roof type</td><td style="font-size:14px">${doc.roofType || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Address</td><td style="font-size:14px">${[doc.address, location].filter(Boolean).join(', ') || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Timeline</td><td style="font-weight:600;font-size:14px;color:#d97706">${doc.timeline || '—'}</td></tr>
            </table>

            <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">System Request</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:6px 0;color:#6b7280;width:140px;font-size:14px">Components</td><td style="font-weight:600;font-size:14px">${fmtComponents(doc.components)}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">System size</td><td style="font-size:14px">${doc.systemKw ? doc.systemKw + ' kW' : '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Battery size</td><td style="font-size:14px">${doc.batteryKwh ? doc.batteryKwh + ' kWh' : '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Monthly bill</td><td style="font-size:14px">${doc.monthlyBill ? '$' + doc.monthlyBill : '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Usage pattern</td><td style="font-size:14px">${doc.usagePattern || '—'}</td></tr>
            </table>

            ${doc.notes ? `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:16px;font-size:14px;color:#374151"><b>Notes:</b><br/>${doc.notes}</div>` : ''}

            <a href="${process.env.SERVER_URL}/admin/collections/quotes/${doc.id}"
               style="display:inline-block;margin-top:8px;background:#d97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
              View in Admin Panel →
            </a>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send business notification:', err)
  }

  // ── 2. Confirm to the customer ──────────────────────────
  if (!doc.email) return
  try {
    await sendMail({
      to: doc.email,
      subject: `Thanks ${doc.firstName || 'there'} — your Bluven Energy quote request`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0a1628;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;font-size:22px">Thanks, ${doc.firstName || 'there'}!</h2>
            <p style="margin:6px 0 0;opacity:.75;font-size:15px">We've received your quote request.</p>
          </div>
          <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
            <p style="font-size:15px;color:#374151;line-height:1.6">
              A Bluven Energy engineer will be in touch within <strong>24 business hours</strong> to discuss your requirements.
              We'll review your system preferences and prepare a detailed quote — no obligation, no pressure.
            </p>

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
              <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af">Your request summary</h3>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:5px 0;color:#6b7280;width:160px;font-size:13px">Interested in</td><td style="font-size:13px;font-weight:600">${fmtComponents(doc.components)}</td></tr>
                ${doc.systemKw ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px">System size</td><td style="font-size:13px">${doc.systemKw} kW</td></tr>` : ''}
                ${doc.batteryKwh ? `<tr><td style="padding:5px 0;color:#6b7280;font-size:13px">Battery</td><td style="font-size:13px">${doc.batteryKwh} kWh</td></tr>` : ''}
                <tr><td style="padding:5px 0;color:#6b7280;font-size:13px">Location</td><td style="font-size:13px">${location || doc.state || '—'}</td></tr>
              </table>
            </div>

            <p style="font-size:14px;color:#6b7280;line-height:1.6">
              If you need to reach us in the meantime:<br/>
              📞 <a href="tel:${process.env.NOTIFY_EMAIL || '1300258836'}" style="color:#d97706">1300 BLUVEN</a><br/>
              ✉️ <a href="mailto:${NOTIFY()}" style="color:#d97706">${NOTIFY()}</a>
            </p>
            <p style="font-size:13px;color:#9ca3af">Bluven Energy Pty Ltd · CEC Approved Retailer</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send customer confirmation:', err)
  }
}
