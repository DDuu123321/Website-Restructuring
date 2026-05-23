import { CollectionConfig } from 'payload/types'

const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'customerName',
    group: '📰 Content',
    description: 'Customer reviews. Public submissions are auto-approved. Admins can pin or delete.',
    defaultColumns: ['customerName', 'suburb', 'rating', 'pinned', 'status', 'sortOrder'],
  },
  access: {
    // Anyone can submit AND read approved reviews (publicly listed)
    create: () => true,
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'approved' } }
    },
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        // On public create, force status to 'approved' (auto-publish)
        if (operation === 'create' && !req.user) {
          return { ...(data || {}), status: 'approved' }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'approved',
      options: [
        { label: '✅ Approved (visible)', value: 'approved' },
        { label: '🚫 Hidden', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Switch to "Hidden" to remove from public site without deleting.',
      },
    },
    {
      name: 'pinned',
      type: 'checkbox',
      label: '📌 Pin to top',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pinned reviews appear before others on the home & reviews page.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order (within pinned/unpinned group)',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower = shown first.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on homepage carousel',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'customerName',
      type: 'text',
      label: 'Customer Name',
      required: true,
    },
    {
      name: 'suburb',
      type: 'text',
      label: 'Suburb / State',
      required: true,
      admin: { description: 'e.g. "Mosman, NSW"' },
    },
    {
      name: 'rating',
      type: 'select',
      label: 'Rating',
      defaultValue: '5',
      options: ['5','4','3','2','1'].map(n => ({ label: `${'★'.repeat(+n)} (${n})`, value: n })),
    },
    {
      name: 'review',
      type: 'textarea',
      label: 'Review',
      required: true,
    },
    {
      name: 'systemInstalled',
      type: 'text',
      label: 'System Installed (optional)',
      admin: { description: 'e.g. "13 kW solar + 15 kWh battery"' },
    },
    {
      name: 'projectRef',
      type: 'relationship',
      label: 'Linked Project (optional)',
      relationTo: 'projects',
    },
  ],
  timestamps: true,
}

export default Testimonials
