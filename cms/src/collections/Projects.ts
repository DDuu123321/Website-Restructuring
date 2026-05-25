import { CollectionConfig } from 'payload/types'

const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: { en: '📰 Content', zh: '📰 网站内容' },
    description: 'Real installation case studies shown on the Projects page.',
    defaultColumns: ['title', 'location', 'systemType', 'featured', 'status'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: '📝 Draft', value: 'draft' },
        { label: '✅ Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on homepage',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower number = shown first.',
      },
    },

    // ── Core ──
    {
      name: 'title',
      type: 'text',
      label: 'Project Title',
      required: true,
      admin: { description: 'e.g. "4-bed home in Mosman — 13 kW + 15 kWh battery"' },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: 'Main Photo',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Photo Gallery',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },

    // ── Details ──
    {
      name: 'location',
      type: 'text',
      label: 'Location (Suburb, State)',
      required: true,
      admin: { description: 'e.g. "Mosman, NSW"' },
    },
    {
      name: 'systemType',
      type: 'select',
      label: 'System Type',
      required: true,
      options: [
        { label: 'Solar Only', value: 'solar' },
        { label: 'Solar + Battery', value: 'solar-battery' },
        { label: 'Solar + EV Charger', value: 'solar-ev' },
        { label: 'Full System (Solar + Battery + EV)', value: 'full' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Battery Retrofit', value: 'battery-retrofit' },
      ],
    },
    {
      name: 'specs',
      type: 'group',
      label: 'System Specs',
      fields: [
        { name: 'solarKw', type: 'number', label: 'Solar size (kW)' },
        { name: 'batteryKwh', type: 'number', label: 'Battery size (kWh)' },
        { name: 'panels', type: 'number', label: 'Number of panels' },
        { name: 'inverter', type: 'text', label: 'Inverter brand/model' },
        { name: 'battery', type: 'text', label: 'Battery brand/model' },
        { name: 'completionYear', type: 'number', label: 'Year completed' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Short Summary',
      required: true,
      admin: { description: '1-2 sentences shown on the project card.' },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Full Description',
    },
    {
      name: 'testimonial',
      type: 'group',
      label: 'Customer Quote (optional)',
      fields: [
        { name: 'quote', type: 'textarea', label: 'Quote text' },
        { name: 'customerName', type: 'text', label: 'Customer name' },
        { name: 'customerSuburb', type: 'text', label: 'Suburb' },
      ],
    },
  ],
}

export default Projects
