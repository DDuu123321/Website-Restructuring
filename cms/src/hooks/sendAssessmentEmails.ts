import { sendMail, notifyEmail } from '../lib/mailer'

const NOTIFY = () => notifyEmail()

function fmtList(v: string[] | undefined) {
  if (!Array.isArray(v) || v.length === 0) return '—'
  return v.join(', ')
}

function row(label: string, value: string | number | undefined | null) {
  return `<tr><td style="padding:6px 0;color:#6b7280;width:170px;font-size:14px">${label}</td><td style="font-size:14px;color:#0f172a">${value || '—'}</td></tr>`
}

export async function sendAssessmentEmails(doc: any) {
  const name = `${doc.firstName || ''} ${doc.lastName || ''}`.trim()
  const location = [doc.suburb, doc.state, doc.postcode].filter(Boolean).join(' ')
  const a = doc.answers || {}
  const r = doc.result || {}
  const reasons: string[] = Array.isArray(r.billReasons)
    ? r.billReasons.map((x: any) => (typeof x === 'string' ? x : x?.reason)).filter(Boolean)
    : []

  // ── 1. Notify the business ──────────────────────────────
  try {
    await sendMail({
      to: NOTIFY(),
      replyTo: doc.email,
      subject: `🧠 New Assessment Lead — ${name} (${doc.state || '?'}) · ${r.recommendationType || 'Assessment'}`,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto">
          <div style="background:#042744;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
            <h2 style="margin:0;font-size:20px">New Assessment Lead</h2>
            <p style="margin:4px 0 0;opacity:.75;font-size:14px">Submitted via the Free Assessment quiz on bluven.com.au</p>
          </div>
          <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">

            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Contact</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              ${row('Name', name)}
              <tr><td style="padding:6px 0;color:#6b7280;width:170px;font-size:14px">Email</td><td style="font-size:14px"><a href="mailto:${doc.email}" style="color:#d97706">${doc.email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Phone</td><td style="font-size:14px"><a href="tel:${doc.phone}" style="color:#d97706">${doc.phone}</a></td></tr>
              ${row('Address', [doc.address, location].filter(Boolean).join(', '))}
            </table>

            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Recommendation</h3>
            <div style="background:#fff9e8;border:1px solid #ffc61f;border-radius:8px;padding:16px;margin-bottom:24px">
              <div style="font-size:13px;color:#0a4d89;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px">Engine output</div>
              <div style="font-size:20px;font-weight:900;color:#042744;margin-bottom:4px">${r.recommendationType || '—'}</div>
              <div style="font-size:14px;color:#475569"><b>${r.householdType || '—'}</b> · ${r.fitLevel || '—'}</div>
              ${r.summary ? `<p style="margin:10px 0 0;font-size:14px;color:#374151;line-height:1.55">${r.summary}</p>` : ''}
            </div>

            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Quiz answers</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              ${row('Home size',       a.homeSize)}
              ${row('Occupants',       a.occupants)}
              ${row('Active time',     a.activityTime)}
              ${row('Major loads',     fmtList(a.majorLoads))}
              ${row('Solar status',    a.solarStatus)}
              ${row('Battery status',  a.batteryStatus)}
              ${row('Main goal',       fmtList(a.mainGoal))}
              ${row('Bill level',      a.billLevel)}
            </table>

            ${reasons.length ? `
              <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280">Why their bill may be higher</h3>
              <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:1.6">
                ${reasons.map(x => `<li style="margin-bottom:4px">${x}</li>`).join('')}
              </ul>
            ` : ''}

            <a href="${process.env.SERVER_URL}/admin/collections/assessments/${doc.id}"
               style="display:inline-block;margin-top:8px;background:#d97706;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
              View in Admin Panel →
            </a>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send assessment business notification:', err)
  }

  // ── 2. Send the customer their personalised report ──────
  if (!doc.email) return
  try {
    await sendMail({
      to: doc.email,
      subject: `Your Bluven Energy Assessment Report — ${doc.firstName || 'there'}`,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto">
          <div style="background:#042744;color:#fff;padding:28px 32px;border-radius:8px 8px 0 0">
            <div style="display:inline-block;padding:5px 12px;border-radius:999px;background:rgba(255,198,31,.14);border:1px solid rgba(255,198,31,.32);color:#ffc61f;font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px">Your Energy Report</div>
            <h2 style="margin:0;font-size:24px;line-height:1.2">Hi ${doc.firstName || 'there'} — here's your home energy result.</h2>
            <p style="margin:8px 0 0;opacity:.8;font-size:14px;line-height:1.55">Thanks for completing the Bluven Free Assessment. Below is your tailored summary, plus the next step our engineers recommend.</p>
          </div>
          <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:18px">
              <div style="font-size:12px;color:#0a4d89;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px">Your home energy type</div>
              <div style="font-size:22px;font-weight:900;color:#042744;line-height:1.2;margin-bottom:8px">${r.householdType || 'Energy Household'}</div>
              <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:#fff9e8;color:#042744;font-weight:700;font-size:12px;letter-spacing:.06em">${r.fitLevel || 'Fit assessed'}</div>
              ${r.summary ? `<p style="margin:14px 0 0;font-size:14.5px;color:#374151;line-height:1.65">${r.summary}</p>` : ''}
            </div>

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:18px">
              <div style="font-size:12px;color:#0a4d89;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px">Recommended direction</div>
              <div style="font-size:20px;font-weight:900;color:#042744">${r.recommendationType || '—'}</div>
            </div>

            ${reasons.length ? `
              <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:18px">
                <div style="font-size:12px;color:#0a4d89;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px">What may be increasing your bill</div>
                <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.7">
                  ${reasons.map(x => `<li style="margin-bottom:6px">${x}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${r.nextStep ? `
              <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:18px">
                <div style="font-size:12px;color:#0a4d89;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Your next step</div>
                <p style="margin:0;font-size:14.5px;color:#374151;line-height:1.65">${r.nextStep}</p>
              </div>
            ` : ''}

            <p style="font-size:14.5px;color:#374151;line-height:1.65;margin:18px 0">
              A senior Bluven Energy engineer will reach out within <strong>24 business hours</strong> to walk you through your result and prepare a tailored next step — no obligation.
            </p>

            <div style="text-align:center;margin:18px 0 6px">
              <a href="${process.env.SERVER_URL || 'https://bluven.com.au'}/quote"
                 style="display:inline-block;background:#ffc61f;color:#042744;padding:13px 26px;border-radius:999px;text-decoration:none;font-weight:900;font-size:15px">
                Get My Tailored Energy Plan →
              </a>
            </div>

            <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:20px 0 0">
              Need to talk now?<br/>
              📞 <a href="tel:+611300258836" style="color:#d97706">1300 258 836</a><br/>
              ✉️ <a href="mailto:${NOTIFY()}" style="color:#d97706">${NOTIFY()}</a>
            </p>
            <p style="font-size:12px;color:#9ca3af;margin-top:14px">Bluven Energy Pty Ltd · CEC Approved Retailer</p>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Failed to send assessment customer report:', err)
  }
}
