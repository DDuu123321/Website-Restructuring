import { GlobalConfig } from 'payload/types'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '⚙️ Site Settings',
  admin: {
    group: '⚙️ System',
    description: 'Global settings — contact details, AI chat, lead notifications.',
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
        {
          name: 'quoteEmail',
          type: 'email',
          label: 'Lead Notification Email',
          admin: { description: 'Optional — internal new-lead emails (quotes, assessments, subscribers) are sent here. Leave blank to use the NOTIFY_EMAIL env var. Not published on the website.' },
          // This global is public-read (the site needs phone/address/social),
          // which was handing this internal inbox to any scraper that called
          // /api/globals/site-settings. Server-side reads (the notification
          // hooks) use overrideAccess and are unaffected.
          access: { read: ({ req }) => Boolean(req.user) },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'supportEmail',
          type: 'email',
          label: 'Support Inbox',
          defaultValue: 'support@bluven.com.au',
          admin: { description: 'Technical / after-sales requests from the /support form are sent here. Not published on the website.' },
          access: { read: ({ req }) => Boolean(req.user) },
        },
        {
          name: 'operationsEmail',
          type: 'email',
          label: 'Operations Inbox',
          defaultValue: 'operations@bluven.com.au',
          admin: { description: '"Installation or delivery follow-up" requests from the /support form are sent here instead. Not published on the website.' },
          access: { read: ({ req }) => Boolean(req.user) },
        },
      ],
    },
    // address / social / Default-SEO / announcement-bar groups removed
    // 2026-08-02 (owner decision): stored for months, rendered by nothing —
    // admins were editing dead switches. Columns dropped in the
    // 20260802_020000 migration.

    // ── AI Chat ──
    {
      name: 'chat',
      type: 'group',
      label: 'AI Chat Settings',
      admin: {
        description: 'Sunny, the AI assistant bubble shown on every page. Turning it off hides the widget and disables the chat API. Every conversation is stored under AI Chats; when Sunny hands a case over, its summary is emailed to the owning team (new enquiries → Lead Notification Email, or info@bluven.com.au if blank; order questions → Operations Inbox; after-sales → Support Inbox). New enquiries with a phone number also appear under Quotes with source "ai-chat".',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Enable AI chat widget', defaultValue: true },
        { name: 'greeting', type: 'textarea', label: 'Welcome message', admin: { description: 'First bubble visitors see. Leave blank for the built-in default.' } },
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
          '"Email" controls the internal notification sent to the Lead Notification Email above (or the NOTIFY_EMAIL env var if blank). ' +
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
            { name: 'emailOnSubscriber', type: 'checkbox', label: '📧 Email me about new subscribers',   defaultValue: true },
            { name: 'adminOnSubscriber', type: 'checkbox', label: '🔔 Show unread subscribers in admin', defaultValue: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'emailOnSupport',    type: 'checkbox', label: '📧 Email the team about new support requests', defaultValue: true, admin: { description: 'Goes to the Support / Operations inbox above, not the Lead Notification Email.' } },
            { name: 'adminOnSupport',    type: 'checkbox', label: '🔔 Show unread support requests in admin',    defaultValue: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'emailOnChat',       type: 'checkbox', label: '📧 Email the team when the AI chat hands a case over', defaultValue: true, admin: { description: 'Routed by type to the sales, operations or support inbox.' } },
            { name: 'adminOnChat',       type: 'checkbox', label: '🔔 Show unread AI chat hand-overs in admin',         defaultValue: true },
          ],
        },
      ],
    },
  ],
}

export default SiteSettings
