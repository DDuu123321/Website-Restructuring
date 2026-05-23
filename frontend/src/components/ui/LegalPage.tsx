'use client'

import { Reveal } from './Reveal'
import { PageHeader } from './PageHeader'

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        h: '1. Information we collect',
        p: 'When you submit a quote request or contact us, we collect basic details such as your name, phone, email and address.',
      },
      {
        h: '2. How we use it',
        p: 'We use this information solely to respond to your enquiries, provide quotes, and ongoing service. We never sell your data to third parties.',
      },
      {
        h: '3. Your rights',
        p: 'You may contact us at any time to access, update or delete your personal data.',
      },
      {
        h: '4. Contact us',
        p: 'For questions, email privacy@bluven.com.au',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      {
        h: '1. About these terms',
        p: 'By using the Bluven Energy website and services, you agree to these Terms of Service.',
      },
      {
        h: '2. Quotes and contracts',
        p: 'Quote requests submitted via this site do not constitute a contract. All formal contracts are issued separately by our sales engineers.',
      },
      {
        h: '3. Warranties',
        p: 'We provide a 25-year performance warranty and 10+ years manufacturer product warranty on all systems.',
      },
      {
        h: '4. Contact',
        p: 'legal@bluven.com.au',
      },
    ],
  },
  cookies: {
    title: 'Cookie Notice',
    sections: [
      {
        h: '1. What are cookies',
        p: 'Cookies are small text files stored on your device. They help remember your preferences and improve your experience.',
      },
      {
        h: '2. Cookies we use',
        p: 'Essential — language preferences and session state. Analytics — Google Analytics (anonymous usage stats).',
      },
      {
        h: '3. Managing cookies',
        p: 'You can disable cookies in your browser settings, although some site features may stop working.',
      },
    ],
  },
} as const

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
                Last updated: May 2026
              </p>
              {c.sections.map((s, i) => (
                <div key={i}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginTop: 28, marginBottom: 12 }}>
                    {s.h}
                  </h2>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
