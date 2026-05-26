import { CollectionConfig } from 'payload/types'
import { sendQuoteEmails } from '../hooks/sendQuoteEmails'
import ExportCsvButton from '../admin/ExportCsvButton'
import ImportCsvButton from '../admin/ImportCsvButton'

const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'fullName',
    group: '📥 Leads',
    description: 'Quote requests submitted via the website form.',
    defaultColumns: ['fullName', 'email', 'phone', 'systemType', 'state', 'status', 'createdAt'],
    listSearchableFields: ['firstName', 'lastName', 'email', 'phone', 'suburb'],
    components: {
      BeforeListTable: [ExportCsvButton, ImportCsvButton],
    },
  },
  access: {
    create: () => true,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && !req.user) {
          let adminOn = true
          try {
            const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
            adminOn = settings?.notifications?.adminOnQuote !== false
          } catch { /* default on */ }
          return { ...(data || {}), status: adminOn ? 'new' : 'contacted' }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        let emailOn = true
        try {
          const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
          emailOn = settings?.notifications?.emailOnQuote !== false
        } catch { /* default on */ }
        if (emailOn) await sendQuoteEmails(doc)
      },
    ],
  },
  fields: [
    // ── Admin sidebar ──
    {
      name: 'status',
      type: 'select',
      label: 'Lead Status',
      defaultValue: 'new',
      options: [
        { label: '🆕 New',             value: 'new' },
        { label: '📞 Contacted',        value: 'contacted' },
        { label: '📅 Booked',           value: 'booked' },
        { label: '✅ Won',              value: 'won' },
        { label: '❌ Not interested',   value: 'lost' },
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

    // ── Contact ──
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
    { name: 'email',    type: 'email', label: 'Email',    required: true },
    { name: 'phone',    type: 'text',  label: 'Phone',    required: true },
    {
      name: 'bestTime',
      type: 'select',
      label: 'Best Time to Call',
      options: [
        { label: 'Anytime business hours', value: 'anytime' },
        { label: 'Mornings (9–12)',         value: 'morning' },
        { label: 'Afternoons (12–5)',       value: 'afternoon' },
        { label: 'After 5 pm',              value: 'evening' },
        { label: 'Email only please',       value: 'email-only' },
      ],
    },

    // ── Property ──
    {
      name: 'propertyType',
      type: 'select',
      label: 'Property Type',
      options: [
        { label: 'House',            value: 'House' },
        { label: 'Townhouse / Unit', value: 'Townhouse / Unit' },
        { label: 'Commercial',       value: 'Commercial' },
      ],
    },
    { name: 'roofType', type: 'text', label: 'Roof Type' },
    { name: 'address',  type: 'text', label: 'Street Address' },
    { name: 'suburb',   type: 'text', label: 'Suburb' },
    {
      name: 'state',
      type: 'select',
      label: 'State',
      options: ['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'].map(s => ({ label: s, value: s })),
    },
    { name: 'postcode', type: 'text', label: 'Postcode' },
    {
      name: 'timeline',
      type: 'select',
      label: 'Purchase Timeline',
      options: [
        { label: 'ASAP',             value: 'asap' },
        { label: 'Within 1 month',   value: '1-month' },
        { label: '1–3 months',       value: '1-3-months' },
        { label: 'Just researching', value: 'researching' },
      ],
    },

    // ── System ──
    {
      name: 'components',
      type: 'select',
      label: 'Interested In',
      hasMany: true,
      options: [
        { label: 'Solar Panels',         value: 'Solar' },
        { label: 'Battery Storage',       value: 'Battery' },
        { label: 'EV Charger',            value: 'EV' },
        { label: 'Heat-pump Hot Water',   value: 'Heat pump' },
      ],
    },
    { name: 'systemKw',    type: 'number', label: 'Desired System Size (kW)' },
    { name: 'batteryKwh',  type: 'number', label: 'Desired Battery Size (kWh)' },
    { name: 'monthlyBill', type: 'number', label: 'Monthly Power Bill (AUD)' },
    {
      name: 'usagePattern',
      type: 'select',
      label: 'Usage Pattern',
      options: [
        { label: 'Mostly daytime', value: 'daytime' },
        { label: 'Mixed',           value: 'mixed' },
        { label: 'Mostly evening',  value: 'evening' },
      ],
    },
    { name: 'notes', type: 'textarea', label: 'Additional Notes' },

    // ── Source tracking ──
    {
      name: 'source',
      type: 'group',
      label: 'Source',
      admin: { description: 'Where the lead came from.' },
      fields: [
        { name: 'referrer',      type: 'text', label: 'Referrer URL' },
        { name: 'utm_source',    type: 'text', label: 'UTM Source' },
        { name: 'utm_campaign',  type: 'text', label: 'UTM Campaign' },
        { name: 'packagePreset', type: 'text', label: 'Package Preset (if entered from package button)' },
      ],
    },
  ],
  timestamps: true,
}

export default Quotes
