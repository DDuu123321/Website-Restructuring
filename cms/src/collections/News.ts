import { CollectionConfig } from 'payload/types'
import { layoutField } from '../blocks/layoutBlocks'
import BulkEditButton from '../admin/BulkEditButton'
import ArticleImportPanel from '../admin/ArticleImportPanel'

const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    group: '📰 Content',
    description: 'Articles shown on the News page (/news). Each article gets its own page at /news/<slug>.',
    defaultColumns: ['title', 'category', 'featured', 'publishedAt'],
    listSearchableFields: ['title', 'summary'],
    components: {
      BeforeListTable: [BulkEditButton],
    },
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
      label: 'Feature at top of News page',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Shows as the big lead story at the top of /news. If none is ticked, the newest article takes that spot.',
      },
    },

    // ── Main fields ──
    {
      // Paste an AI-written article and have it fill the fields below.
      // `admin` must be present: the Edit view reads field.admin.position
      // without optional chaining and would throw on a bare ui field.
      name: 'articleImport',
      type: 'ui',
      admin: {
        components: { Field: ArticleImportPanel },
        // It is an editing aid, not data — keep it out of the list columns
        // and out of the bulk-edit field picker.
        disableListColumn: true,
        disableBulkEdit: true,
      },
    },
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
        description: 'Used in the URL. Use lowercase letters, numbers and hyphens only. Leave blank to generate it from the title.',
        // Chrome sees an empty text input near a title and offers a saved URL —
        // it was filling this with "https://www.bluven.com.au/", which is not a
        // slug and silently breaks the article's address.
        autoComplete: 'off',
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
    layoutField,
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
