import { CollectionConfig } from 'payload/types'

const FAQ: CollectionConfig = {
  slug: 'faq',
  admin: {
    useAsTitle: 'question',
    group: { en: '📰 Content', zh: '📰 网站内容' },
    description: 'Frequently asked questions. Drag to reorder.',
    defaultColumns: ['question', 'category', 'sortOrder', 'published'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { published: { equals: true } }
    },
  },
  fields: [
    {
      name: 'published',
      type: 'checkbox',
      label: { en: 'Published', zh: '已发布' },
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: { en: 'Sort Order', zh: '排序' },
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower number = shown first within category.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: { en: 'Category', zh: '分类' },
      required: true,
      options: [
        { label: { en: 'General',              zh: '常见问题' },     value: 'general' },
        { label: { en: 'Pricing & Rebates',    zh: '价格与补贴' },   value: 'pricing' },
        { label: { en: 'Installation',         zh: '安装' },         value: 'installation' },
        { label: { en: 'Products',             zh: '产品' },         value: 'products' },
        { label: { en: 'Monitoring & Support', zh: '监控与支持' },   value: 'support' },
        { label: { en: 'Net Metering & Grid',  zh: '上网电价与电网' }, value: 'grid' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'question',
      type: 'text',
      label: { en: 'Question', zh: '问题' },
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      label: { en: 'Answer', zh: '答案' },
      required: true,
    },
  ],
}

export default FAQ
