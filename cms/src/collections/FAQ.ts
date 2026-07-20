import { CollectionConfig } from 'payload/types'

const FAQ: CollectionConfig = {
  slug: 'faq',
  admin: {
    useAsTitle: 'question',
    group: '📰 Content',
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
      label: 'Published',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower number = shown first within category.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      required: true,
      options: [
        // Live-site FAQ sections use: general / solar / battery / support.
        // NOTE: keep this array in Postgres-enum order — original six values
        // first, new values appended at the END (drizzle diffs enums by order,
        // and Postgres can only append enum labels).
        { label: 'General & Installation',   value: 'general' },
        { label: 'Pricing & Rebates',        value: 'pricing' },
        { label: 'Installation',             value: 'installation' },
        { label: 'Products',                 value: 'products' },
        { label: 'Warranty & Support',       value: 'support' },
        { label: 'Net Metering & Grid',      value: 'grid' },
        { label: 'Solar Panels & Inverters', value: 'solar' },
        { label: 'Battery Storage',          value: 'battery' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'question',
      type: 'text',
      label: 'Question',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      label: 'Answer',
      required: true,
    },
  ],
}

export default FAQ
