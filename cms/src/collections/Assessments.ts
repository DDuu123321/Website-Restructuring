import { CollectionConfig } from 'payload/types'
import { sendAssessmentEmails } from '../hooks/sendAssessmentEmails'
import ExportCsvButton from '../admin/ExportCsvButton'
import ImportCsvButton from '../admin/ImportCsvButton'

const Assessments: CollectionConfig = {
  slug: 'assessments',
  admin: {
    useAsTitle: 'fullName',
    group: '📥 Leads',
    description: 'Free home-energy assessment submissions captured from the website quiz.',
    defaultColumns: ['fullName', 'email', 'phone', 'recommendationType', 'state', 'status', 'createdAt'],
    listSearchableFields: ['firstName', 'lastName', 'email', 'phone', 'suburb', 'postcode'],
    components: {
      BeforeListTable: [ExportCsvButton, ImportCsvButton],
    },
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
          let adminOn = true
          try {
            const settings: any = await req.payload.findGlobal({ slug: 'site-settings' })
            adminOn = settings?.notifications?.adminOnAssessment !== false
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
          emailOn = settings?.notifications?.emailOnAssessment !== false
        } catch { /* default on */ }
        if (emailOn) await sendAssessmentEmails(doc)
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
        { label: '🆕 New',                  value: 'new' },
        { label: '📞 Contacted',             value: 'contacted' },
        { label: '✅ Qualified',             value: 'qualified' },
        { label: '🎯 Converted to quote',    value: 'converted' },
        { label: '❌ Not interested',        value: 'lost' },
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
    { name: 'email',    type: 'email', label: 'Email',          required: true },
    { name: 'phone',    type: 'text',  label: 'Phone',          required: true },
    { name: 'address',  type: 'text',  label: 'Street Address' },
    { name: 'suburb',   type: 'text',  label: 'Suburb' },
    {
      name: 'state',
      type: 'select',
      label: 'State',
      options: ['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'].map(s => ({ label: s, value: s })),
    },
    { name: 'postcode', type: 'text',  label: 'Postcode', required: true },

    // ── Quiz answers (raw) ──
    {
      name: 'answers',
      type: 'group',
      label: 'Quiz Answers',
      admin: { description: 'Raw answers from the 8-question assessment.' },
      fields: [
        { name: 'homeSize',     type: 'text', label: 'Home size' },
        { name: 'occupants',    type: 'text', label: 'Occupants' },
        { name: 'activityTime', type: 'text', label: 'Active time of day' },
        {
          name: 'majorLoads',
          type: 'select',
          label: 'Major loads',
          hasMany: true,
          options: [
            'Ducted air conditioning',
            'Pool pump',
            'Electric hot water',
            'EV charger',
            'Spa / workshop / granny flat',
            'No major loads',
          ].map(v => ({ label: v, value: v })),
        },
        { name: 'solarStatus',   type: 'text', label: 'Solar status' },
        { name: 'batteryStatus', type: 'text', label: 'Battery status' },
        {
          name: 'mainGoal',
          type: 'select',
          label: 'Main goals',
          hasMany: true,
          options: [
            'Lower my electricity bills',
            'Use more of my solar energy',
            'Backup during blackouts',
            'Prepare for future energy needs',
            'Join a Virtual Power Plant (VPP)',
            'Take advantage of free midday charging',
            'Not sure yet',
          ].map(v => ({ label: v, value: v })),
        },
        { name: 'billLevel',     type: 'text', label: 'Bill level' },
      ],
    },

    // ── Computed result ──
    {
      name: 'result',
      type: 'group',
      label: 'Computed Result',
      admin: { description: 'Recommendation generated by the quiz engine.' },
      fields: [
        { name: 'householdType',      type: 'text',     label: 'Household type' },
        { name: 'recommendationType', type: 'text',     label: 'Recommendation' },
        { name: 'fitLevel',           type: 'text',     label: 'Fit level' },
        { name: 'summary',            type: 'textarea', label: 'Summary' },
        { name: 'nextStep',           type: 'textarea', label: 'Next step text' },
        {
          name: 'billReasons',
          type: 'array',
          label: 'Bill reasons',
          fields: [{ name: 'reason', type: 'textarea' }],
        },
        {
          name: 'profile',
          type: 'group',
          label: 'Profile levels',
          fields: [
            { name: 'usage',   type: 'text' },
            { name: 'daytime', type: 'text' },
            { name: 'night',   type: 'text' },
            { name: 'load',    type: 'text' },
            { name: 'backup',  type: 'text' },
          ],
        },
        {
          name: 'scores',
          type: 'json',
          label: 'Raw scores (debug)',
        },
      ],
    },

    // ── Source tracking ──
    {
      name: 'source',
      type: 'group',
      label: 'Source',
      admin: { description: 'Where the lead came from.' },
      fields: [
        { name: 'referrer',     type: 'text', label: 'Referrer URL' },
        { name: 'utm_source',   type: 'text', label: 'UTM Source' },
        { name: 'utm_campaign', type: 'text', label: 'UTM Campaign' },
      ],
    },
  ],
  timestamps: true,
}

export default Assessments
