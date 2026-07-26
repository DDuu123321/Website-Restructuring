import { NextResponse } from 'next/server'
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
 */
export async function POST(req: Request) {
  const expected = process.env.MAIL_RELAY_KEY
  if (!expected || req.headers.get('x-relay-key') !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { to, subject, html, replyTo, from } = body || {}
  if (!to || !subject || !html) {
    return NextResponse.json({ error: 'to, subject and html are required' }, { status: 400 })
  }

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
      from: from || process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      replyTo,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[send-mail] relay send failed:', err?.code, err?.message)
    return NextResponse.json({ error: 'send failed' }, { status: 502 })
  }
}
