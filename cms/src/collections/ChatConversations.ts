import { CollectionConfig } from 'payload/types'

/**
 * Every conversation visitors have with Sunny (the AI chat), one row per
 * browser session, written by POST /api/chat through the local API.
 *
 * - `transcript` is refreshed on every turn, so abandoned chats are visible too.
 * - When Sunny hands a case over (see lib/chatHandover.ts) the summary,
 *   keywords and structured fields are filled in, the row turns "new" and the
 *   summary is emailed to the team that owns that type of request.
 *
 * Nothing here is publicly writable or readable: visitors only ever reach it
 * through the chat endpoint.
 */
const ChatConversations: CollectionConfig = {
  slug: 'chat-conversations',
  labels: { singular: 'AI Chat', plural: 'AI Chats' },
  admin: {
    useAsTitle: 'title',
    group: '📥 Leads',
    description: 'Conversations with Sunny, the AI assistant. "New" = Sunny handed the case to a team and nobody has reviewed it yet; "Open" = the visitor left without a hand-over (transcript only).',
    defaultColumns: ['title', 'type', 'priority', 'keywords', 'routedTo', 'status', 'updatedAt'],
    listSearchableFields: ['customerName', 'customerEmail', 'customerPhone', 'keywords', 'summary', 'request'],
  },
  access: {
    create: ({ req }) => !!req.user,
    read:   ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    // ── Admin sidebar ──
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'open',
      options: [
        { label: '💬 Open (no hand-over)', value: 'open' },
        { label: '🆕 New hand-over',       value: 'new' },
        { label: '✅ Reviewed',            value: 'reviewed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'New enquiry (sales)',         value: 'new_enquiry' },
        { label: 'Existing order (operations)', value: 'existing_order' },
        { label: 'After-sales (support)',       value: 'service' },
        { label: 'Other',                       value: 'other' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'priority',
      type: 'select',
      label: 'Priority',
      options: [
        { label: '🔴 Urgent', value: 'urgent' },
        { label: '🟠 High',   value: 'high' },
        { label: 'Normal',    value: 'normal' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'routedTo', type: 'text', label: 'Emailed to', admin: { position: 'sidebar', readOnly: true } },
    { name: 'quoteId',  type: 'number', label: 'Quote created (ID)', admin: { position: 'sidebar', readOnly: true, description: 'New enquiries with a phone number also become a Quote.' } },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: { position: 'sidebar', description: 'Not visible to the customer.' },
    },

    // ── Hand-over summary ──
    {
      name: 'title',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => `${data?.customerName || 'Anonymous visitor'} — ${data?.request || 'no hand-over'}`.slice(0, 200),
        ],
      },
    },
    { name: 'summary',  type: 'textarea', label: 'Customer needs (summary)', admin: { readOnly: true } },
    { name: 'request',  type: 'text',     label: 'Request',  admin: { readOnly: true } },
    { name: 'keywords', type: 'text',     label: 'Keywords', admin: { readOnly: true } },
    { name: 'missing',  type: 'text',     label: 'Still missing', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'customerName',  type: 'text', label: 'Name',  admin: { readOnly: true } },
        { name: 'customerPhone', type: 'text', label: 'Phone', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'customerEmail', type: 'text', label: 'Email',    admin: { readOnly: true } },
        { name: 'postcode',      type: 'text', label: 'Postcode', admin: { readOnly: true } },
      ],
    },
    { name: 'details', type: 'json', label: 'All collected details', admin: { readOnly: true } },

    // ── Conversation ──
    { name: 'transcript',     type: 'textarea', label: 'Transcript', admin: { readOnly: true, rows: 20 } },
    { name: 'messageCount',   type: 'number',   label: 'Messages',   admin: { readOnly: true } },
    { name: 'conversationId', type: 'text',     label: 'Conversation ID', required: true, unique: true, index: true, admin: { readOnly: true } },
  ],
  timestamps: true,
}

export default ChatConversations
