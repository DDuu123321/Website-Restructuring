import { CollectionConfig } from 'payload/types'

/**
 * Newsletter subscribers — one of the site's three lead-collection channels
 * (quotes / reviews / newsletter). Public create (the /news subscribe box),
 * admin-only read.
 */
const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    group: '📥 Leads',
    description: 'Newsletter signups from the Insights page.',
    defaultColumns: ['email', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'email', type: 'email', label: 'Email', required: true, unique: true },
    {
      name: 'source',
      type: 'text',
      label: 'Signup Source',
      defaultValue: 'news-page',
      admin: { readOnly: true },
    },
  ],
}

export default Subscribers
