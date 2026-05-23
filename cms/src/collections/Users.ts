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
    read: () => true,
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
