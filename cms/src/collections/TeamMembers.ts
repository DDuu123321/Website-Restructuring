import { CollectionConfig } from 'payload/types'

const TeamMembers: CollectionConfig = {
  slug: 'team',
  admin: {
    useAsTitle: 'name',
    group: { en: '📰 Content', zh: '📰 网站内容' },
    description: 'Team members shown on the Who We Are page.',
    defaultColumns: ['name', 'title', 'sortOrder'],
  },
  access: { read: () => true },
  fields: [
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
      label: 'Full Name',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Job Title',
      required: true,
      admin: { description: 'e.g. "Lead Solar Engineer"' },
    },
    {
      name: 'photo',
      type: 'upload',
      label: 'Photo',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
    },
    {
      name: 'certifications',
      type: 'array',
      label: 'Certifications / Accreditations',
      fields: [
        { name: 'cert', type: 'text', label: 'Certification' },
      ],
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn URL (optional)',
    },
  ],
}

export default TeamMembers
