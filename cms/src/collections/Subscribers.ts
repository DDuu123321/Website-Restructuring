import { CollectionConfig } from 'payload/types'
import { sendSubscriberEmail } from '../hooks/sendSubscriberEmail'
import ExportCsvButton from '../admin/ExportCsvButton'
import BulkEditButton from '../admin/BulkEditButton'

/**
 * Newsletter subscribers — one of the site's three lead-collection channels
 * (quotes / assessments / newsletter). Public signups go through
 * POST /api/subscribe; admin-only everything else.
 *
 * There is no in-CMS mail-out: to send the monthly email, use the CSV export
 * button above the list and feed it to your mail platform.
 */
const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: '📥 Leads',
    description:
      'Newsletter signups from the Insights page. Export CSV to send the monthly email from your mail platform — the CMS stores the list, it does not send campaigns.',
    defaultColumns: ['email', 'source', 'status', 'createdAt'],
    components: {
      BeforeListTable: [BulkEditButton, ExportCsvButton],
    },
  },
  access: {
    // Public signups go through POST /api/subscribe (endpoints/subscribe.ts),
    // which is idempotent so a duplicate can't be used to test whether an
    // address is already on the list. Direct creates stay admin-only.
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      // Same pattern as Quotes: land as 🆕 New unless the admin toggle is off.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          let adminOn = true
          try {
            const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
            adminOn = settings?.notifications?.adminOnSubscriber !== false
          } catch { /* default on */ }
          return { ...(data || {}), status: adminOn ? 'new' : 'seen' }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        if ((req as { context?: { skipNotifications?: boolean } }).context?.skipNotifications) return
        let emailOn = true
        let notifyTo: string | undefined
        try {
          const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
          emailOn = settings?.notifications?.emailOnSubscriber !== false
          notifyTo = settings?.quoteEmail || undefined
        } catch { /* default on */ }
        // Fire-and-forget, same as Quotes: the signup is already saved and the
        // /api/subscribe response must not wait on SMTP.
        if (emailOn) {
          void sendSubscriberEmail(doc, notifyTo).catch((err) =>
            req.payload.logger.error(`subscriber notification email failed: ${err?.message || err}`),
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'new',
      options: [
        { label: '🆕 New',  value: 'new' },
        { label: '✓ Seen', value: 'seen' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'email', type: 'email', label: 'Email', required: true, unique: true },
    {
      name: 'source',
      type: 'text',
      label: 'Signup Source',
      defaultValue: 'news-page',
      admin: { readOnly: true },
    },
  ],
}

export default Subscribers
