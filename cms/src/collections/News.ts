import { CollectionConfig } from 'payload/types'

const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    group: { en: '📰 Content', zh: '📰 网站内容' },
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
      label: { en: 'Publish Date', zh: '发布日期' },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'category',
      type: 'select',
      label: { en: 'Category', zh: '分类' },
      required: true,
      options: [
        { label: { en: 'Industry News',   zh: '行业新闻' },   value: 'industry' },
        { label: { en: 'Policy & Rebates', zh: '政策与补贴' }, value: 'policy' },
        { label: { en: 'Solar Knowledge', zh: '光伏知识' },   value: 'knowledge' },
        { label: { en: 'Company Updates', zh: '公司动态' },   value: 'company' },
        { label: { en: 'Case Studies',    zh: '案例研究' },   value: 'case-study' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: { en: 'Feature on homepage', zh: '在首页精选' },
      defaultValue: false,
      admin: { position: 'sidebar' },
    },

    // ── Main fields ──
    {
      name: 'title',
      type: 'text',
      label: { en: 'Title', zh: '标题' },
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: { en: 'URL Slug', zh: 'URL 路径' },
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
      label: { en: 'Cover Image', zh: '封面图' },
      relationTo: 'media',
      required: false,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: { en: 'Summary', zh: '摘要' },
      required: true,
      admin: {
        description: 'Short description shown in article cards (1-2 sentences).',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: { en: 'Article Body', zh: '正文内容' },
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      label: { en: 'Author Name', zh: '作者姓名' },
      defaultValue: 'Bluven Energy Team',
    },
    {
      name: 'readTime',
      type: 'number',
      label: { en: 'Read Time (minutes)', zh: '阅读时长（分钟）' },
      admin: {
        description: 'Leave blank to auto-calculate.',
      },
    },

    // ── SEO ──
    {
      name: 'seo',
      type: 'group',
      label: { en: 'SEO', zh: 'SEO 优化' },
      admin: {
        description: 'Overrides for search engine listings. Leave blank to use title & summary.',
      },
      fields: [
        { name: 'metaTitle',       type: 'text',     label: { en: 'Meta Title',       zh: 'Meta 标题' } },
        { name: 'metaDescription', type: 'textarea', label: { en: 'Meta Description', zh: 'Meta 描述' } },
      ],
    },
  ],
}

export default News
