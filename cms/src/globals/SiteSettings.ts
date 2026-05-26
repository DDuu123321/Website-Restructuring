import { GlobalConfig } from 'payload/types'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '⚙️ Site Settings',
  admin: {
    group: '⚙️ System',
    description: 'Global settings — phone, email, address, social links.',
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // ── Contact ──
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Phone Number', defaultValue: '1300 BLUVEN' },
        { name: 'phoneHref', type: 'text', label: 'Phone tel: href', defaultValue: '+611300258836', admin: { description: 'e.g. +611300258836' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'Contact Email', defaultValue: 'info@bluven.com.au' },
        { name: 'quoteEmail', type: 'email', label: 'Quote Notification Email', defaultValue: 'info@bluven.com.au' },
      ],
    },
    {
      name: 'address',
      type: 'group',
      label: 'Business Address',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'suburb', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postcode', type: 'text' },
        { name: 'country', type: 'text', defaultValue: 'Australia' },
      ],
    },

    // ── Social ──
    {
      name: 'social',
      type: 'group',
      label: 'Social Media',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn URL' },
        { name: 'youtube', type: 'text', label: 'YouTube URL' },
      ],
    },

    // ── SEO defaults ──
    {
      name: 'seo',
      type: 'group',
      label: 'Default SEO',
      fields: [
        { name: 'siteName', type: 'text', label: 'Site Name', defaultValue: 'Bluven Energy' },
        { name: 'defaultDescription', type: 'textarea', label: 'Default Meta Description' },
        { name: 'ogImage', type: 'upload', label: 'Default OG Image', relationTo: 'media' },
        { name: 'googleAnalyticsId', type: 'text', label: 'Google Analytics ID', admin: { description: 'e.g. G-XXXXXXXXXX' } },
      ],
    },

    // ── Announcement bar ──
    {
      name: 'announcement',
      type: 'group',
      label: 'Announcement Bar',
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Show announcement bar', defaultValue: false },
        { name: 'text', type: 'text', label: 'Announcement text' },
        { name: 'linkText', type: 'text', label: 'Link text (optional)' },
        { name: 'linkUrl', type: 'text', label: 'Link URL (optional)' },
      ],
    },

    // ── AI Chat ──
    {
      name: 'chat',
      type: 'group',
      label: 'AI Chat Settings',
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Enable AI chat widget', defaultValue: false },
        { name: 'greeting', type: 'textarea', label: 'Welcome message' },
      ],
    },

    // ── Notifications ──
    {
      name: 'notifications',
      type: 'group',
      label: '🔔 Notification Settings',
      admin: {
        description:
          'Toggle email + admin notifications independently for each lead type. ' +
          '"Email" controls the internal notification sent to NOTIFY_EMAIL. ' +
          '"Admin" controls whether new submissions show up highlighted (🆕 New) in the admin + unread badge.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'emailOnQuote',      type: 'checkbox', label: '📧 Email me about new quotes',         defaultValue: true },
            { name: 'adminOnQuote',      type: 'checkbox', label: '🔔 Show unread quotes in admin',       defaultValue: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'emailOnAssessment', type: 'checkbox', label: '📧 Email me about new assessments',   defaultValue: true },
            { name: 'adminOnAssessment', type: 'checkbox', label: '🔔 Show unread assessments in admin', defaultValue: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'emailOnReview',     type: 'checkbox', label: '📧 Email me about new reviews',       defaultValue: true },
            { name: 'adminOnReview',     type: 'checkbox', label: '🔔 Show unread reviews in admin',     defaultValue: true },
          ],
        },
      ],
    },
  ],
}

export default SiteSettings
