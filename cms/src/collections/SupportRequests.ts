import { CollectionConfig } from 'payload/types'
import { sendSupportEmails, SUPPORT_ISSUE_TYPES } from '../hooks/sendSupportEmails'
import { auEmail, auPhone, auPostcode } from '../lib/validators'
import { honeypotField, assertNotBot } from '../lib/honeypot'

/**
 * After-sales support requests from the /support form. Same shape of pipeline
 * as Quotes (public create → status by admin toggle → fire-and-forget emails),
 * but these are tickets for the technical / operations teams, not sales leads:
 * they are deliberately NOT part of the CRM lead sync or the CSV tooling.
 */
const SupportRequests: CollectionConfig = {
  slug: 'support-requests',
  labels: { singular: 'Support Request', plural: 'Support Requests' },
  admin: {
    useAsTitle: 'fullName',
    group: '📥 Leads',
    description: 'After-sales support requests submitted via the website /support form.',
    defaultColumns: ['fullName', 'issueType', 'phone', 'email', 'postcode', 'state', 'status', 'createdAt'],
    listSearchableFields: ['firstName', 'lastName', 'email', 'phone', 'postcode', 'address'],
  },
  access: {
    create: () => true,
    read:   ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && !req.user) {
          assertNotBot(data, req.user)
          let adminOn = true
          try {
            const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
            adminOn = settings?.notifications?.adminOnSupport !== false
          } catch { /* default on */ }
          return { ...(data || {}), status: adminOn ? 'new' : 'in-progress' }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        let emailOn = true
        let supportTo: string | undefined
        let operationsTo: string | undefined
        try {
          const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
          emailOn = settings?.notifications?.emailOnSupport !== false
          supportTo = settings?.supportEmail || undefined
          operationsTo = settings?.operationsEmail || undefined
        } catch { /* default on */ }
        // Fire-and-forget — same reasoning as Quotes: never block the API
        // response on SMTP; failures go to the deploy logs instead.
        // Always called: the customer confirmation is unconditional; emailOn
        // gates only the team notification inside the hook.
        void sendSupportEmails(
          doc,
          {
            support:    supportTo    || 'support@bluven.com.au',
            operations: operationsTo || 'operations@bluven.com.au',
          },
          emailOn,
        ).catch((err) =>
          req.payload.logger.error(`support notification email failed: ${err?.message || err}`),
        )
      },
    ],
  },
  fields: [
    // ── Admin sidebar ──
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'new',
      options: [
        { label: '🆕 New',         value: 'new' },
        { label: '🔧 In progress', value: 'in-progress' },
        { label: '✅ Resolved',    value: 'resolved' },
        { label: '🗂 Closed',      value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: {
        position: 'sidebar',
        description: 'Not visible to the customer.',
      },
    },

    // ── Customer ──
    { name: 'firstName', type: 'text',  label: 'First Name', required: true },
    { name: 'lastName',  type: 'text',  label: 'Last Name' },
    {
      name: 'fullName',
      type: 'text',
      label: 'Full Name',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => `${data?.firstName || ''} ${data?.lastName || ''}`.trim(),
        ],
      },
    },
    { name: 'email',    type: 'email', label: 'Email', required: true, validate: auEmail(true) },
    { name: 'phone',    type: 'text',  label: 'Phone', required: true, validate: auPhone(true) },

    // ── Site ──
    { name: 'address',  type: 'text', label: 'Installation Address' },
    {
      name: 'state',
      type: 'select',
      label: 'State',
      options: ['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'].map(s => ({ label: s, value: s })),
    },
    { name: 'postcode', type: 'text', label: 'Postcode', required: true, validate: auPostcode(true) },

    // ── Issue ──
    {
      name: 'issueType',
      type: 'select',
      label: 'Issue Type',
      required: true,
      options: SUPPORT_ISSUE_TYPES.map(t => ({ label: t.label, value: t.value })),
      admin: { description: '"Installation or delivery follow-up" is emailed to the operations inbox; every other type goes to the support inbox.' },
    },
    { name: 'product',       type: 'text', label: 'Product / brand',     maxLength: 200 },
    { name: 'installedWhen', type: 'text', label: 'Approx. install date', maxLength: 100 },
    { name: 'description',   type: 'textarea', label: 'Issue Description', required: true, maxLength: 5000 },

    // ── Source tracking ──
    {
      name: 'source',
      type: 'group',
      label: 'Source',
      fields: [
        { name: 'referrer', type: 'text', label: 'Referrer URL' },
      ],
    },
    honeypotField,
  ],
  timestamps: true,
}

export default SupportRequests
