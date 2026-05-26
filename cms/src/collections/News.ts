import { CollectionConfig } from 'payload/types'

const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    group: '📰 Content',
    description: 'Industry insights, news articles, and company updates.',
    defaultColumns: ['title', 'category', 'featured', 'publishedAt'],
    listSearchableFields: ['title', 'summary'],
  },
  // Public-read everything — draft state removed at user request.
  // Hide an article by deleting or temporarily clearing its slug.
  access: {
    read: () => true,
  },
  fields: [
    // ── Sidebar ──
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publish Date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      required: true,
      options: [
        { label: 'Industry News',     value: 'industry' },
        { label: 'Policy & Rebates',  value: 'policy' },
        { label: 'Solar Knowledge',   value: 'knowledge' },
        { label: 'Company Updates',   value: 'company' },
        { label: 'Case Studies',      value: 'case-study' },
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

    // ── Main fields ──
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      required: true,
      unique: true,
      admin: {
        description: 'Used in the URL. Use lowercase letters, numbers and hyphens only.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .trim()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: 'Cover Image',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Summary',
      required: true,
      admin: {
        description: 'Short description shown in article cards (1-2 sentences).',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Article Body',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      label: 'Author Name',
      defaultValue: 'Bluven Energy Team',
    },
    {
      name: 'readTime',
      type: 'number',
      label: 'Read Time (minutes)',
      admin: {
        description: 'Leave blank to auto-calculate.',
      },
    },

    // ── SEO ──
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      admin: {
        description: 'Overrides for search engine listings. Leave blank to use title & summary.',
      },
      fields: [
        { name: 'metaTitle',       type: 'text',     label: 'Meta Title' },
        { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
      ],
    },
  ],
}

export default News
