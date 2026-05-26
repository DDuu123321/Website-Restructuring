import { CollectionConfig } from 'payload/types'
import { sendQuoteEmails } from '../hooks/sendQuoteEmails'
import ExportCsvButton from '../admin/ExportCsvButton'
import ImportCsvButton from '../admin/ImportCsvButton'

const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'fullName',
    group: { en: '📥 Leads', zh: '📥 销售线索' },
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
      label: { en: 'Lead Status', zh: '线索状态' },
      defaultValue: 'new',
      options: [
        { label: { en: '🆕 New',             zh: '🆕 新建' },     value: 'new' },
        { label: { en: '📞 Contacted',        zh: '📞 已联系' },   value: 'contacted' },
        { label: { en: '📅 Booked',           zh: '📅 已预约' },   value: 'booked' },
        { label: { en: '✅ Won',              zh: '✅ 已成交' },   value: 'won' },
        { label: { en: '❌ Not interested',   zh: '❌ 未跟进' },   value: 'lost' },
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
      name: 'bestTime',
      type: 'select',
      label: { en: 'Best Time to Call', zh: '最佳联系时间' },
      options: [
        { label: { en: 'Anytime business hours', zh: '工作时间均可' },         value: 'anytime' },
        { label: { en: 'Mornings (9–12)',         zh: '上午 9–12 点' },         value: 'morning' },
        { label: { en: 'Afternoons (12–5)',       zh: '下午 12–5 点' },         value: 'afternoon' },
        { label: { en: 'After 5 pm',              zh: '下午 5 点以后' },         value: 'evening' },
        { label: { en: 'Email only please',       zh: '仅邮件联系' },           value: 'email-only' },
      ],
    },

    // ── Property ──
    {
      name: 'propertyType',
      type: 'select',
      label: { en: 'Property Type', zh: '物业类型' },
      options: [
        { label: { en: 'House',            zh: '独立屋' },     value: 'House' },
        { label: { en: 'Townhouse / Unit', zh: '联排 / 公寓' }, value: 'Townhouse / Unit' },
        { label: { en: 'Commercial',       zh: '商业' },       value: 'Commercial' },
      ],
    },
    {
      name: 'roofType',
      type: 'text',
      label: { en: 'Roof Type', zh: '屋顶类型' },
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
    },
    {
      name: 'timeline',
      type: 'select',
      label: { en: 'Purchase Timeline', zh: '购买时间' },
      options: [
        { label: { en: 'ASAP',            zh: '尽快' },         value: 'asap' },
        { label: { en: 'Within 1 month',  zh: '1 个月内' },     value: '1-month' },
        { label: { en: '1–3 months',      zh: '1–3 个月' },     value: '1-3-months' },
        { label: { en: 'Just researching', zh: '只是了解' },     value: 'researching' },
      ],
    },

    // ── System ──
    {
      name: 'components',
      type: 'select',
      label: { en: 'Interested In', zh: '感兴趣的产品' },
      hasMany: true,
      options: [
        { label: { en: 'Solar Panels',         zh: '光伏组件' },        value: 'Solar' },
        { label: { en: 'Battery Storage',       zh: '储能电池' },        value: 'Battery' },
        { label: { en: 'EV Charger',            zh: '电动车充电桩' },     value: 'EV' },
        { label: { en: 'Heat-pump Hot Water',   zh: '热泵热水器' },       value: 'Heat pump' },
      ],
    },
    {
      name: 'systemKw',
      type: 'number',
      label: { en: 'Desired System Size (kW)', zh: '期望系统容量 (kW)' },
    },
    {
      name: 'batteryKwh',
      type: 'number',
      label: { en: 'Desired Battery Size (kWh)', zh: '期望电池容量 (kWh)' },
    },
    {
      name: 'monthlyBill',
      type: 'number',
      label: { en: 'Monthly Power Bill (AUD)', zh: '月度电费 (澳元)' },
    },
    {
      name: 'usagePattern',
      type: 'select',
      label: { en: 'Usage Pattern', zh: '用电模式' },
      options: [
        { label: { en: 'Mostly daytime', zh: '主要白天' },   value: 'daytime' },
        { label: { en: 'Mixed',           zh: '混合' },       value: 'mixed' },
        { label: { en: 'Mostly evening',  zh: '主要晚上' },   value: 'evening' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: { en: 'Additional Notes', zh: '其他备注' },
    },

    // ── Source tracking ──
    {
      name: 'source',
      type: 'group',
      label: { en: 'Source', zh: '线索来源' },
      admin: { description: 'Where the lead came from.' },
      fields: [
        { name: 'referrer',      type: 'text', label: { en: 'Referrer URL',     zh: '来源 URL' } },
        { name: 'utm_source',    type: 'text', label: { en: 'UTM Source',       zh: 'UTM 来源' } },
        { name: 'utm_campaign',  type: 'text', label: { en: 'UTM Campaign',     zh: 'UTM 活动' } },
        { name: 'packagePreset', type: 'text', label: { en: 'Package Preset (if entered from package button)', zh: '套餐预设（如从套餐按钮进入）' } },
      ],
    },
  ],
  timestamps: true,
}

export default Quotes
