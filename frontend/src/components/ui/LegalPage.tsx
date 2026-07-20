'use client'

import { Reveal } from './Reveal'
import { PageHeader } from './PageHeader'

/**
 * Legal pages — drafted 2026-07 against the Privacy Act 1988 (Cth) / 13 APPs
 * (APP 1.4 mandatory policy content, APP 5 collection notice matters, APP 7
 * direct marketing, APP 8 overseas disclosure, APP 11-13), the Spam Act 2003,
 * and ACL ss 18/29/64 carve-out drafting conventions. Section structures follow
 * mainstream AU practice (AGL / Solahart / Origin patterns).
 *
 * NOTE: drafted with AI research assistance — have a lawyer review before
 * relying on these pages for compliance.
 */

const EFFECTIVE_DATE = '20 July 2026'

type Section = { h: string; p: string[] }

const CONTENT: Record<'privacy' | 'terms' | 'cookies', { title: string; sections: Section[] }> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        h: '1. About this policy',
        p: [
          'This policy explains how Bluven Energy Pty Ltd (ABN 38 692 264 412) ("Bluven", "we", "us") collects, holds, uses and discloses personal information. We operate across Queensland, South Australia, Victoria, Western Australia and New South Wales.',
          'We handle personal information in line with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). This policy is available free of charge on this website; contact us if you would like it in another format.',
        ],
      },
      {
        h: '2. What personal information we collect',
        p: [
          'Quote and assessment requests: your name, email address, phone number, property address, state, and the energy details you choose to share (such as your power bill, usage pattern, roof and system preferences).',
          'Newsletter signups: your email address.',
          'AI support chat: the messages you type into the chat assistant.',
          'Technical data: standard website logs and, where enabled, analytics data such as pages visited, device and browser type, and approximate location. See our Cookie Notice for details.',
        ],
      },
      {
        h: '3. How we collect it',
        p: [
          'Directly from you — through the quote form, free assessment, newsletter box, AI chat, or when you call or email us. We collect only what is reasonably necessary to provide our services.',
          'You can browse this website, and ask general questions in the AI chat, without identifying yourself. We only ask for contact details when you want a quote, assessment or subscription.',
        ],
      },
      {
        h: '4. Why we collect, use and disclose it',
        p: [
          'To prepare quotes and energy assessments, design and deliver solar and battery systems, provide customer service and warranty support, send our newsletter to subscribers, improve our website and services, and meet legal obligations (including rebate scheme requirements).',
          'We do not sell your personal information.',
        ],
      },
      {
        h: '5. Our AI chat assistant',
        p: [
          'The support chat on this website is an artificial-intelligence assistant. Messages you send to it are processed by Google (Gemini) to generate responses.',
          'Please do not enter sensitive personal information (for example health or financial account details) into the chat. Chat answers are general information only — your quote and system design always come from our engineers.',
        ],
      },
      {
        h: '6. Who we share your information with',
        p: [
          'Service providers that help us run the business: website and data hosting, our content-management and lead-management systems, email delivery, and Google (AI chat processing and, where enabled, analytics).',
          'Installation partners and subcontractors, where needed to deliver your installation; and government or scheme bodies where required for rebates and certificates (for example STC processes).',
        ],
      },
      {
        h: '7. Overseas disclosure',
        p: [
          'Some of our service providers process data outside Australia. In particular, AI chat messages and analytics data are processed by Google, whose servers are located in the United States and other countries.',
          'Where we disclose personal information overseas, we take reasonable steps consistent with APP 8 to ensure it is handled in line with the Australian Privacy Principles.',
        ],
      },
      {
        h: '8. Direct marketing and how to opt out',
        p: [
          'We only send marketing (such as our newsletter) where you have signed up or would reasonably expect it, consistent with APP 7 and the Spam Act 2003 (Cth). Every marketing email identifies us and contains a working unsubscribe link.',
          'You can opt out at any time via the unsubscribe link or by contacting us — we will action opt-outs promptly. We respect the Do Not Call Register for any telemarketing.',
        ],
      },
      {
        h: '9. Cookies and analytics',
        p: [
          'Our website uses a small set of cookies for essential site functions, and may use analytics tools such as Google Analytics. See our Cookie Notice for what we use and how to manage or disable cookies.',
        ],
      },
      {
        h: '10. How we hold and protect your information',
        p: [
          'Your information is held in access-controlled systems (our website database and content-management system). We take reasonable steps to protect it from misuse, interference, loss and unauthorised access, modification or disclosure.',
          'When personal information is no longer needed for a purpose described in this policy, we take reasonable steps to destroy or de-identify it.',
        ],
      },
      {
        h: '11. Accessing and correcting your information',
        p: [
          'You can ask us at any time for access to the personal information we hold about you, or ask us to correct information that is inaccurate, out of date or incomplete. There is no charge for making a request, and we aim to respond within 30 days.',
          'If we ever refuse a request, we will tell you why in writing and how you can complain about the refusal.',
        ],
      },
      {
        h: '12. Complaints',
        p: [
          'If you believe we have mishandled your personal information, please contact us first using the details below. We will acknowledge your complaint, investigate it and respond to you — normally within 30 days.',
          'If you are not satisfied with our response, you can complain to the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au or on 1300 363 992.',
        ],
      },
      {
        h: '13. Changes to this policy',
        p: [
          'We review this policy regularly and will publish any updated version on this page with a new effective date.',
        ],
      },
      {
        h: '14. Contact us',
        p: [
          'Privacy enquiries: info@bluven.com.au · 1300 258 836 · Bluven Energy Pty Ltd, 135-153 New South Head Road, Edgecliff NSW 2027.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      {
        h: '1. About these terms',
        p: [
          'These terms govern your use of the Bluven Energy website. By using this website you agree to them. They are issued by Bluven Energy Pty Ltd (ABN 38 692 264 412), operating across QLD, SA, VIC, WA and NSW.',
        ],
      },
      {
        h: '2. Our website and services',
        p: [
          'This website provides information about our solar, battery and EV charging services, and lets you request quotes and assessments, subscribe to our newsletter, and chat with our AI assistant. No payments are taken through this website.',
          'Submitting a quote or assessment request does not create a contract. Any installation is subject to a separate written agreement issued after a site assessment.',
        ],
      },
      {
        h: '3. Website information is general only',
        p: [
          'Content on this website — including savings examples, system-sizing guidance and assessment results — is general information. It does not take into account your individual circumstances and is not financial, technical or professional advice. Actual system performance and savings depend on your site, tariffs and usage.',
        ],
      },
      {
        h: '4. Quotes, estimates, rebates and STCs',
        p: [
          'Online estimates and assessment results are indicative only and remain subject to a physical site inspection. Formal quotes state their own validity period.',
          'Government incentives (including Small-scale Technology Certificates) are subject to eligibility criteria and scheme rules, and STC values fluctuate with the market — they are not guaranteed until your system is installed and certificates are created. Bluven is not affiliated with any government body.',
        ],
      },
      {
        h: '5. Australian Consumer Law',
        p: [
          'Our goods and services come with guarantees that cannot be excluded under the Australian Consumer Law. Nothing in these terms excludes, restricts or modifies any consumer guarantee, right or remedy you have under the Australian Consumer Law or any other law that cannot lawfully be excluded.',
        ],
      },
      {
        h: '6. Warranties',
        p: [
          'Products we install carry their manufacturers’ warranties (typically 25-year panel performance and 10-year inverter/battery product warranties — see each product’s documentation), and our installations are covered by our workmanship warranty as stated in your installation agreement.',
          'These warranty benefits are in addition to your rights under the Australian Consumer Law.',
        ],
      },
      {
        h: '7. AI chat assistant',
        p: [
          'The support chat is powered by artificial intelligence (Google Gemini). Its answers are automatically generated general information: they may be incomplete or inaccurate, are not professional, electrical or financial advice, and do not bind Bluven on pricing or system design. Verify important information with our engineers before acting on it.',
        ],
      },
      {
        h: '8. Acceptable use',
        p: [
          'You must not use this website or the chat assistant unlawfully, attempt to gain unauthorised access, scrape or bulk-harvest content, submit false or misleading information in forms, or attempt to manipulate the AI assistant into producing harmful content.',
        ],
      },
      {
        h: '9. Intellectual property',
        p: [
          'All content on this website (text, images, logos, code and tools) is owned by or licensed to Bluven Energy Pty Ltd. You may view and download content for personal, non-commercial use; any other reproduction or use requires our written consent.',
        ],
      },
      {
        h: '10. Third-party links',
        p: [
          'Links to third-party websites are provided for convenience. We do not endorse and are not responsible for their content or privacy practices.',
        ],
      },
      {
        h: '11. Liability',
        p: [
          'To the maximum extent permitted by law, and subject always to section 5 above, Bluven is not liable for indirect or consequential loss arising from use of this website or reliance on its general information.',
        ],
      },
      {
        h: '12. Privacy',
        p: [
          'Our Privacy Policy and Cookie Notice explain how we handle your personal information and form part of these terms.',
        ],
      },
      {
        h: '13. Changes to these terms',
        p: [
          'We may update these terms from time to time by publishing a revised version on this page. Changes apply prospectively from publication.',
        ],
      },
      {
        h: '14. Governing law',
        p: [
          'These terms are governed by the laws of New South Wales, and you submit to the non-exclusive jurisdiction of its courts. Nothing in this clause limits your rights under the Australian Consumer Law.',
        ],
      },
      {
        h: '15. Contact',
        p: [
          'Bluven Energy Pty Ltd (ABN 38 692 264 412) · info@bluven.com.au · 1300 258 836.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie Notice',
    sections: [
      {
        h: '1. What cookies are',
        p: [
          'Cookies and similar technologies (such as local storage) are small pieces of data stored on your device by websites you visit. They help websites function and remember your preferences.',
        ],
      },
      {
        h: '2. Our approach',
        p: [
          'Australia does not require cookie consent banners; instead, the Privacy Act 1988 (Cth) requires transparency where cookies involve personal information. This notice explains what we use so you can make informed choices.',
        ],
      },
      {
        h: '3. Cookies we use',
        p: [
          'Essential — required for the website to function (for example session state and remembering preferences). These are always on.',
          'Analytics — if enabled, we use Google Analytics to understand how the site is used (pages visited, device type, approximate location). Analytics data is collected in aggregate and processed by Google.',
          'We do not run third-party advertising or social-media tracking cookies on this website.',
        ],
      },
      {
        h: '4. Third parties and overseas processing',
        p: [
          'Analytics and AI chat data are processed by Google, whose servers are located in the United States and other countries. See section 7 of our Privacy Policy for how we approach overseas disclosure.',
        ],
      },
      {
        h: '5. Managing cookies',
        p: [
          'You can block or delete cookies in your browser settings (see your browser’s help pages). You can also opt out of Google Analytics across all websites via tools.google.com/dlpage/gaoptout. Blocking essential cookies may stop parts of the site from working.',
        ],
      },
      {
        h: '6. Updates and contact',
        p: [
          'We will publish any changes to this notice on this page with a new effective date. Questions: info@bluven.com.au.',
        ],
      },
    ],
  },
}

export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'cookies' }) {
  const c = CONTENT[type]

  return (
    <>
      <PageHeader title={c.title} background="cream" />
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <Reveal>
            <div style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--bv-gray-700)' }}>
              <p style={{ marginBottom: 24, color: 'var(--bv-gray-500)', fontSize: 14 }}>
                Effective date: {EFFECTIVE_DATE}
              </p>
              {c.sections.map((s, i) => (
                <div key={i}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginTop: 28, marginBottom: 12 }}>
                    {s.h}
                  </h2>
                  {s.p.map((para, j) => (
                    <p key={j} style={{ marginBottom: 12 }}>{para}</p>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
