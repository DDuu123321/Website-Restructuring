import { CollectionConfig } from 'payload/types'
import { sendReviewEmail } from '../hooks/sendReviewEmail'

const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'customerName',
    group: '📥 Leads',
    description: 'Customer reviews. Public submissions are auto-published; admins can pin, hide, or delete.',
    defaultColumns: ['customerName', 'suburb', 'rating', 'pinned', 'status', 'createdAt'],
    listSearchableFields: ['customerName', 'suburb', 'review'],
  },
  access: {
    create: () => true,                            // anyone can submit a review
    read: ({ req }) => {
      if (req.user) return true
      // Public sees everything except hidden
      return { status: { not_equals: 'hidden' } }
    },
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // On public create, default the status based on the adminOnReview toggle.
        // - adminOnReview=true  → status='new'      (highlighted in admin + badge counts)
        // - adminOnReview=false → status='reviewed' (silent, still publicly visible)
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
      label: 'Status',
      defaultValue: 'new',
      options: [
        { label: '🆕 New (unread)',      value: 'new' },
        { label: '✅ Reviewed (visible)', value: 'reviewed' },
        { label: '🚫 Hidden',             value: 'hidden' },
      ],
      admin: {
        position: 'sidebar',
        description: 'New = visible + counted in unread badge. Reviewed = visible, no badge. Hidden = removed from public site.',
      },
    },
    {
      name: 'pinned',
      type: 'checkbox',
      label: '📌 Pin to homepage',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pinned reviews show on the homepage. Unpinned ones only appear on /reviews.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower = shown first within the pinned/unpinned group.',
      },
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
