import { CollectionConfig } from 'payload/types'
import path from 'path'

const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: '⚙️ System',
    description: 'All uploaded images and files.',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: path.resolve(__dirname, '../../../uploads'),
    staticURL: '/uploads',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
      admin: {
        description: 'Describe this image for screen readers and SEO.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
  ],
}

export default Media
