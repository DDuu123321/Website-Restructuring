import { CollectionConfig } from 'payload/types'

const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    group: { en: '📰 Content', zh: '📰 网站内容' },
    description: 'Partner / approved brands shown on the /brands page. Group by category, sort by featured + sortOrder.',
    defaultColumns: ['name', 'model', 'category', 'tier', 'featured', 'sortOrder'],
  },
  access: { read: () => true },
  fields: [
    {
      name: 'featured',
      type: 'checkbox',
      label: { en: 'Featured (shown first)', zh: '精选（优先显示）' },
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: { en: 'Sort Order', zh: '排序' },
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'select',
      label: { en: 'Category', zh: '类别' },
      required: true,
      options: [
        { label: { en: 'Solar Panels',     zh: '光伏组件' },     value: 'panels' },
        { label: { en: 'Inverters',         zh: '逆变器' },       value: 'inverter' },
        { label: { en: 'Battery Storage',   zh: '储能电池' },     value: 'battery' },
        { label: { en: 'EV Charging',       zh: '电动车充电桩' },  value: 'ev' },
        { label: { en: 'Monitoring',        zh: '监控系统' },     value: 'monitoring' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'tier',
      type: 'select',
      label: { en: 'Tier', zh: '档次' },
      defaultValue: 'tier-1',
      options: [
        { label: { en: 'Tier 1',  zh: 'Tier 1' },  value: 'tier-1' },
        { label: { en: 'Premium', zh: 'Premium' }, value: 'premium' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      type: 'text',
      label: { en: 'Brand Name', zh: '品牌名称' },
      required: true,
      admin: { description: 'e.g. "Trina Solar", "Tesla", "SiGenergy"' },
    },
    {
      name: 'model',
      type: 'text',
      label: { en: 'Model / Product Name', zh: '型号 / 产品名称' },
      admin: { description: 'e.g. "Vertex S+ 440 W", "Powerwall 3"' },
    },
    {
      name: 'logo',
      type: 'upload',
      label: { en: 'Logo (optional — falls back to brand name)', zh: 'Logo（可选，未上传时显示品牌名）' },
      relationTo: 'media',
    },
    {
      name: 'logoUrl',
      type: 'text',
      label: { en: 'External Logo URL (optional)', zh: '外部 Logo URL（可选）' },
      admin: { description: 'e.g. https://logo.clearbit.com/tesla.com — used if Logo is not uploaded.' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', zh: '描述' },
      required: true,
      admin: { description: 'One short paragraph shown under the brand model name.' },
    },
    {
      name: 'spec1',
      type: 'text',
      label: { en: 'Spec 1 (power / capacity)', zh: '参数 1（功率 / 容量）' },
      admin: { description: 'e.g. "440 W", "13.5 kWh", "5–25 kW"' },
    },
    {
      name: 'spec2',
      type: 'text',
      label: { en: 'Spec 2 (warranty / efficiency)', zh: '参数 2（保修 / 效率）' },
      admin: { description: 'e.g. "10-yr warranty", "22.0% efficient"' },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      label: { en: 'Website URL', zh: '官方网站' },
    },
  ],
}

export default Brands
