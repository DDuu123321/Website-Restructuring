import { CollectionConfig } from 'payload/types'
import { sendAssessmentEmails } from '../hooks/sendAssessmentEmails'
import ExportCsvButton from '../admin/ExportCsvButton'
import ImportCsvButton from '../admin/ImportCsvButton'

const Assessments: CollectionConfig = {
  slug: 'assessments',
  admin: {
    useAsTitle: 'fullName',
    group: { en: '📥 Leads', zh: '📥 销售线索' },
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
      label: { en: 'Lead Status', zh: '线索状态' },
      defaultValue: 'new',
      options: [
        { label: { en: '🆕 New',                  zh: '🆕 新建' },      value: 'new' },
        { label: { en: '📞 Contacted',             zh: '📞 已联系' },    value: 'contacted' },
        { label: { en: '✅ Qualified',             zh: '✅ 已确认意向' }, value: 'qualified' },
        { label: { en: '🎯 Converted to quote',    zh: '🎯 已转报价' },  value: 'converted' },
        { label: { en: '❌ Not interested',        zh: '❌ 未跟进' },    value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: { en: 'Internal Notes', zh: '内部备注' },
      admin: {
        position: 'sidebar',
        description: 'Not visible to the customer.',
      },
    },

    // ── Contact ──
    {
      name: 'firstName',
      type: 'text',
      label: { en: 'First Name', zh: '名字' },
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      label: { en: 'Last Name', zh: '姓氏' },
    },
    {
      name: 'fullName',
      type: 'text',
      label: { en: 'Full Name', zh: '全名' },
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => `${data?.firstName || ''} ${data?.lastName || ''}`.trim(),
        ],
      },
    },
    {
      name: 'email',
      type: 'email',
      label: { en: 'Email', zh: '邮箱' },
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: { en: 'Phone', zh: '电话' },
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      label: { en: 'Street Address', zh: '街道地址' },
    },
    {
      name: 'suburb',
      type: 'text',
      label: { en: 'Suburb', zh: '区域' },
    },
    {
      name: 'state',
      type: 'select',
      label: { en: 'State', zh: '州' },
      options: ['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'].map(s => ({ label: s, value: s })),
    },
    {
      name: 'postcode',
      type: 'text',
      label: { en: 'Postcode', zh: '邮编' },
      required: true,
    },

    // ── Quiz answers (raw) ──
    {
      name: 'answers',
      type: 'group',
      label: { en: 'Quiz Answers', zh: '问卷答案' },
      admin: { description: 'Raw answers from the 8-question assessment.' },
      fields: [
        { name: 'homeSize',     type: 'text', label: { en: 'Home size',           zh: '家庭规模' } },
        { name: 'occupants',    type: 'text', label: { en: 'Occupants',           zh: '居住人数' } },
        { name: 'activityTime', type: 'text', label: { en: 'Active time of day',  zh: '活跃时段' } },
        {
          name: 'majorLoads',
          type: 'select',
          label: { en: 'Major loads', zh: '主要用电设备' },
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
        { name: 'solarStatus',   type: 'text', label: { en: 'Solar status',   zh: '光伏现状' } },
        { name: 'batteryStatus', type: 'text', label: { en: 'Battery status', zh: '电池现状' } },
        {
          name: 'mainGoal',
          type: 'select',
          label: { en: 'Main goals', zh: '主要目标' },
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
        { name: 'billLevel',     type: 'text', label: { en: 'Bill level', zh: '电费水平' } },
      ],
    },

    // ── Computed result ──
    {
      name: 'result',
      type: 'group',
      label: { en: 'Computed Result', zh: '推荐结果' },
      admin: { description: 'Recommendation generated by the quiz engine.' },
      fields: [
        { name: 'householdType',      type: 'text',     label: { en: 'Household type',  zh: '家庭类型' } },
        { name: 'recommendationType', type: 'text',     label: { en: 'Recommendation',  zh: '推荐方案' } },
        { name: 'fitLevel',           type: 'text',     label: { en: 'Fit level',       zh: '匹配度' } },
        { name: 'summary',            type: 'textarea', label: { en: 'Summary',         zh: '总结' } },
        { name: 'nextStep',           type: 'textarea', label: { en: 'Next step text',  zh: '下一步建议' } },
        {
          name: 'billReasons',
          type: 'array',
          label: { en: 'Bill reasons', zh: '电费高的原因' },
          fields: [{ name: 'reason', type: 'textarea' }],
        },
        {
          name: 'profile',
          type: 'group',
          label: { en: 'Profile levels', zh: '画像评级' },
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
          label: { en: 'Raw scores (debug)', zh: '原始评分（调试）' },
        },
      ],
    },

    // ── Source tracking ──
    {
      name: 'source',
      type: 'group',
      label: { en: 'Source', zh: '线索来源' },
      admin: { description: 'Where the lead came from.' },
      fields: [
        { name: 'referrer',     type: 'text', label: { en: 'Referrer URL',  zh: '来源 URL' } },
        { name: 'utm_source',   type: 'text', label: { en: 'UTM Source',    zh: 'UTM 来源' } },
        { name: 'utm_campaign', type: 'text', label: { en: 'UTM Campaign',  zh: 'UTM 活动' } },
      ],
    },
  ],
  timestamps: true,
}

export default Assessments
