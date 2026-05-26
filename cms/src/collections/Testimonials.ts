import { CollectionConfig } from 'payload/types'
import { sendReviewEmail } from '../hooks/sendReviewEmail'
import ExportCsvButton from '../admin/ExportCsvButton'
import ImportCsvButton from '../admin/ImportCsvButton'

const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'customerName',
    group: { en: '📰 Content', zh: '📰 网站内容' },
    description: 'Customer reviews. Public submissions are auto-published; admins can pin, hide, or delete.',
    defaultColumns: ['customerName', 'suburb', 'rating', 'pinned', 'status', 'createdAt'],
    listSearchableFields: ['customerName', 'suburb', 'review'],
    components: {
      BeforeListTable: [ExportCsvButton, ImportCsvButton],
    },
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user) return true
      return { status: { not_equals: 'hidden' } }
    },
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
            adminOn = settings?.notifications?.adminOnReview !== false
          } catch { /* settings not initialised yet — fall back to highlighting */ }
          return { ...(data || {}), status: adminOn ? 'new' : 'reviewed' }
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
          emailOn = settings?.notifications?.emailOnReview !== false
        } catch { /* default on */ }
        if (emailOn) await sendReviewEmail(doc)
      },
    ],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: { en: 'Status', zh: '状态' },
      defaultValue: 'new',
      options: [
        { label: { en: '🆕 New (unread)',       zh: '🆕 未读（公开可见）' }, value: 'new' },
        { label: { en: '✅ Reviewed (visible)',  zh: '✅ 已查看（公开可见）' }, value: 'reviewed' },
        { label: { en: '🚫 Hidden',              zh: '🚫 隐藏' },              value: 'hidden' },
      ],
      admin: {
        position: 'sidebar',
        description: 'New = visible + counted in unread badge. Reviewed = visible, no badge. Hidden = removed from public site.',
      },
    },
    {
      name: 'pinned',
      type: 'checkbox',
      label: { en: '📌 Pin to homepage', zh: '📌 置顶到首页' },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pinned reviews show on the homepage. Unpinned ones only appear on /reviews.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: { en: 'Sort Order', zh: '排序' },
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower = shown first within the pinned/unpinned group.',
      },
    },
    {
      name: 'customerName',
      type: 'text',
      label: { en: 'Customer Name', zh: '客户姓名' },
      required: true,
    },
    {
      name: 'suburb',
      type: 'text',
      label: { en: 'Suburb / State', zh: '区域 / 州' },
      required: true,
      admin: { description: 'e.g. "Mosman, NSW"' },
    },
    {
      name: 'rating',
      type: 'select',
      label: { en: 'Rating', zh: '评分' },
      defaultValue: '5',
      options: ['5','4','3','2','1'].map(n => ({ label: `${'★'.repeat(+n)} (${n})`, value: n })),
    },
    {
      name: 'review',
      type: 'textarea',
      label: { en: 'Review', zh: '评论内容' },
      required: true,
    },
    {
      name: 'systemInstalled',
      type: 'text',
      label: { en: 'System Installed (optional)', zh: '已安装的系统（可选）' },
      admin: { description: 'e.g. "13 kW solar + 15 kWh battery"' },
    },
    {
      name: 'projectRef',
      type: 'relationship',
      label: { en: 'Linked Project (optional)', zh: '关联项目（可选）' },
      relationTo: 'projects',
    },
  ],
  timestamps: true,
}

export default Testimonials
