import { CollectionConfig } from 'payload/types'

const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: { en: '📰 Content', zh: '📰 网站内容' },
    description: 'Real installation case studies shown on the Projects page.',
    defaultColumns: ['title', 'location', 'systemType', 'featured', 'sortOrder'],
  },
  // Public-read everything — draft state removed at user request.
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'featured',
      type: 'checkbox',
      label: { en: 'Feature on homepage', zh: '在首页精选' },
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: { en: 'Sort Order', zh: '排序' },
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower number = shown first.',
      },
    },

    // ── Core ──
    {
      name: 'title',
      type: 'text',
      label: { en: 'Project Title', zh: '项目标题' },
      required: true,
      admin: { description: 'e.g. "4-bed home in Mosman — 13 kW + 15 kWh battery"' },
    },
    {
      name: 'slug',
      type: 'text',
      label: { en: 'URL Slug', zh: 'URL 路径' },
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: { en: 'Main Photo', zh: '主图' },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      label: { en: 'Photo Gallery', zh: '相册' },
      fields: [
        { name: 'image',   type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', label: { en: 'Caption', zh: '图片说明' } },
      ],
    },

    // ── Details ──
    {
      name: 'location',
      type: 'text',
      label: { en: 'Location (Suburb, State)', zh: '位置（区域，州）' },
      required: true,
      admin: { description: 'e.g. "Mosman, NSW"' },
    },
    {
      name: 'systemType',
      type: 'select',
      label: { en: 'System Type', zh: '系统类型' },
      required: true,
      options: [
        { label: { en: 'Solar Only',                          zh: '纯光伏' },                 value: 'solar' },
        { label: { en: 'Solar + Battery',                     zh: '光伏 + 电池' },             value: 'solar-battery' },
        { label: { en: 'Solar + EV Charger',                  zh: '光伏 + 电动车充电桩' },     value: 'solar-ev' },
        { label: { en: 'Full System (Solar + Battery + EV)',  zh: '全套（光伏+电池+充电桩）' }, value: 'full' },
        { label: { en: 'Commercial',                          zh: '商用' },                   value: 'commercial' },
        { label: { en: 'Battery Retrofit',                    zh: '电池加装' },               value: 'battery-retrofit' },
      ],
    },
    {
      name: 'specs',
      type: 'group',
      label: { en: 'System Specs', zh: '系统参数' },
      fields: [
        { name: 'solarKw',        type: 'number', label: { en: 'Solar size (kW)',      zh: '光伏容量 (kW)' } },
        { name: 'batteryKwh',     type: 'number', label: { en: 'Battery size (kWh)',   zh: '电池容量 (kWh)' } },
        { name: 'panels',         type: 'number', label: { en: 'Number of panels',     zh: '组件数量' } },
        { name: 'inverter',       type: 'text',   label: { en: 'Inverter brand/model', zh: '逆变器型号' } },
        { name: 'battery',        type: 'text',   label: { en: 'Battery brand/model',  zh: '电池型号' } },
        { name: 'completionYear', type: 'number', label: { en: 'Year completed',       zh: '完工年份' } },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: { en: 'Short Summary', zh: '简短摘要' },
      required: true,
      admin: { description: '1-2 sentences shown on the project card.' },
    },
    {
      name: 'description',
      type: 'richText',
      label: { en: 'Full Description', zh: '完整描述' },
    },
    {
      name: 'testimonial',
      type: 'group',
      label: { en: 'Customer Quote (optional)', zh: '客户评价（可选）' },
      fields: [
        { name: 'quote',          type: 'textarea', label: { en: 'Quote text',     zh: '评价内容' } },
        { name: 'customerName',   type: 'text',     label: { en: 'Customer name',  zh: '客户姓名' } },
        { name: 'customerSuburb', type: 'text',     label: { en: 'Suburb',         zh: '区域' } },
      ],
    },
  ],
}

export default Projects
