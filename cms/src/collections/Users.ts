import { CollectionConfig } from 'payload/types'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: '⚙️ System',
    description: 'Admin accounts with access to the management panel.',
  },
  access: {
    // Was `() => true`, which let anyone GET /api/users and harvest every
    // admin's email/name/role (phishing + credential-stuffing fuel).
    // create/update/delete are left to Payload's default (auth required).
    read: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      defaultValue: 'editor',
      options: [
        { label: 'Super Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}

export default Users
