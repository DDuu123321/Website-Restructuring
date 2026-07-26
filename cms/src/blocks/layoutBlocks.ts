import { Block } from 'payload/types'

/**
 * Page-builder blocks shared by News and Projects.
 *
 * Every block is a pre-designed section: the editor only fills in content and
 * the frontend renders it with the site's design system (see
 * frontend/src/components/blocks/BlockRenderer.tsx — keep the two in sync).
 * Labels/descriptions are written for non-technical editors.
 */

const textSection: Block = {
  slug: 'richText',
  labels: { singular: 'Text Section', plural: 'Text Sections' },
  fields: [
    { name: 'heading', type: 'text', label: 'Heading (optional)' },
    { name: 'body', type: 'richText', label: 'Text', required: true },
  ],
}

const imageText: Block = {
  slug: 'imageText',
  labels: { singular: 'Photo + Text', plural: 'Photo + Text' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Photo' },
    {
      name: 'imageSide',
      type: 'select',
      label: 'Photo position',
      defaultValue: 'left',
      options: [
        { label: 'Photo left, text right', value: 'left' },
        { label: 'Photo right, text left', value: 'right' },
      ],
    },
    { name: 'heading', type: 'text', label: 'Heading (optional)' },
    { name: 'body', type: 'richText', label: 'Text', required: true },
  ],
}

const gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Photo Gallery', plural: 'Photo Galleries' },
  fields: [
    {
      name: 'columns',
      type: 'select',
      label: 'Photos per row',
      defaultValue: '3',
      options: [
        { label: '2 (bigger photos)', value: '2' },
        { label: '3', value: '3' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Photos',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Photo' },
        { name: 'caption', type: 'text', label: 'Caption (optional)' },
      ],
    },
  ],
}

const stats: Block = {
  slug: 'stats',
  labels: { singular: 'Key Numbers Row', plural: 'Key Numbers Rows' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Numbers',
      minRows: 2,
      maxRows: 6,
      fields: [
        { name: 'value', type: 'text', required: true, label: 'Big value (e.g. "13 kW")' },
        { name: 'label', type: 'text', required: true, label: 'Small label (e.g. "Solar array")' },
      ],
    },
  ],
}

const pullQuote: Block = {
  slug: 'pullQuote',
  labels: { singular: 'Customer Quote', plural: 'Customer Quotes' },
  fields: [
    { name: 'text', type: 'textarea', required: true, label: 'Quote' },
    { name: 'name', type: 'text', label: 'Who said it (optional)' },
    { name: 'detail', type: 'text', label: 'Detail line — suburb, role… (optional)' },
  ],
}

const callToAction: Block = {
  slug: 'callToAction',
  labels: { singular: 'Call-to-Action Banner', plural: 'Call-to-Action Banners' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Banner heading', defaultValue: 'Ready to cut your power bills?' },
    { name: 'text', type: 'text', label: 'Supporting line (optional)' },
    { name: 'buttonLabel', type: 'text', label: 'Button text', defaultValue: 'Get a free quote' },
    {
      name: 'buttonHref',
      type: 'text',
      label: 'Button link',
      defaultValue: '/quote',
      admin: { description: 'Where the button goes. Keep /quote unless you have a reason.' },
    },
  ],
}

const video: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Video link',
      admin: { description: 'A YouTube link (https://www.youtube.com/watch?v=…) or a direct .mp4 file link.' },
    },
    { name: 'caption', type: 'text', label: 'Caption (optional)' },
  ],
}

export const layoutBlocks: Block[] = [
  textSection,
  imageText,
  gallery,
  stats,
  pullQuote,
  callToAction,
  video,
]

/** The shared `layout` field both content collections mount. */
export const layoutField = {
  name: 'layout',
  type: 'blocks' as const,
  label: 'Page Builder — extra designed sections',
  labels: { singular: 'Section', plural: 'Sections' },
  blocks: layoutBlocks,
  admin: {
    description:
      'Optional pre-designed sections shown below the main text, automatically styled to match the site — no code or CSS needed. Click "Add Section", pick a design, fill it in; drag to reorder.',
  },
}
