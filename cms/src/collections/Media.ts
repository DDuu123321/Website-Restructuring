import { CollectionConfig } from 'payload/types'
import path from 'path'
import { r2Enabled } from '../lib/storage'

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
    // In R2 mode the cloud-storage plugin handles bytes; skip writing to the
    // (ephemeral on Railway) local disk. Local dev keeps staticDir.
    disableLocalStorage: r2Enabled,
    staticDir: path.resolve(__dirname, '../../../uploads'),
    staticURL: '/uploads',
    // Width-only sizes: sharp resizes by WIDTH and keeps each photo's original
    // aspect ratio (no centre-crop). A 9:16 phone shot and a 4:3 landscape both
    // survive intact; the frontend decides how to frame them per surface.
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
    ],
    adminThumbnail: 'thumbnail',
    // Explicit raster whitelist — NOT 'image/*'. An SVG is a script-bearing
    // document: uploaded to the CMS and opened at /uploads/<file>.svg it runs
    // JavaScript on the CMS's own origin, i.e. stored XSS against an admin
    // session. Brand logos that need to be SVG live in the frontend's
    // /public folder (static, not user-uploadable), so nothing here needs it.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
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
