import { CollectionConfig } from 'payload/types'

const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    group: { en: '📰 Content', zh: '📰 网站内容' },
    description: 'Partner and approved brands shown on the Brands page.',
    defaultColumns: ['name', 'category', 'featured', 'sortOrder'],
  },
  access: { read: () => true },
  fields: [
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured (shown first)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Brand Name',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      required: true,
      hasMany: true,
      options: [
        { label: 'Solar Panels', value: 'panels' },
        { label: 'Battery Storage', value: 'battery' },
        { label: 'Inverters', value: 'inverter' },
        { label: 'EV Charging', value: 'ev' },
        { label: 'Monitoring', value: 'monitoring' },
      ],
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      admin: { description: 'Short description under the logo, e.g. "Australian-made battery"' },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      label: 'Website URL',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description (optional)',
    },
  ],
}

export default Brands
