import { CollectionConfig } from 'payload/types'

const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    group: '📰 Content',
    description: 'Partner / approved brands shown on the /brands page. Group by category, sort by featured + sortOrder.',
    defaultColumns: ['name', 'model', 'category', 'tier', 'featured', 'sortOrder'],
  },
  access: { read: () => true },
  fields: [
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured (shown first)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      required: true,
      options: [
        { label: 'Solar Panels',     value: 'panels' },
        { label: 'Inverters',         value: 'inverter' },
        { label: 'Battery Storage',   value: 'battery' },
        { label: 'EV Charging',       value: 'ev' },
        { label: 'Monitoring',        value: 'monitoring' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'tier',
      type: 'select',
      label: 'Tier',
      defaultValue: 'tier-1',
      options: [
        { label: 'Tier 1',  value: 'tier-1' },
        { label: 'Premium', value: 'premium' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Brand Name',
      required: true,
      admin: { description: 'e.g. "Trina Solar", "Tesla", "SiGenergy"' },
    },
    {
      name: 'model',
      type: 'text',
      label: 'Model / Product Name',
      admin: { description: 'e.g. "Vertex S+ 440 W", "Powerwall 3"' },
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo (optional — falls back to brand name)',
      relationTo: 'media',
    },
    {
      name: 'logoUrl',
      type: 'text',
      label: 'External Logo URL (optional)',
      admin: { description: 'e.g. https://logo.clearbit.com/tesla.com — used if Logo is not uploaded.' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      admin: { description: 'One short paragraph shown under the brand model name.' },
    },
    {
      name: 'spec1',
      type: 'text',
      label: 'Spec 1 (power / capacity)',
      admin: { description: 'e.g. "440 W", "13.5 kWh", "5–25 kW"' },
    },
    {
      name: 'spec2',
      type: 'text',
      label: 'Spec 2 (warranty / efficiency)',
      admin: { description: 'e.g. "10-yr warranty", "22.0% efficient"' },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      label: 'Website URL',
    },
  ],
}

export default Brands
