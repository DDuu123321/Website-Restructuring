/**
 * News category ids → display labels. Mirrors the select options in
 * cms/src/collections/News.ts exactly — keep the two in sync.
 * Shared by the /news list, the article page and its OG image.
 */
export const NEWS_CATEGORY_LABEL: Record<string, string> = {
  industry: 'Industry News',
  policy: 'Policy & Rebates',
  knowledge: 'Solar Knowledge',
  company: 'Company Updates',
  'case-study': 'Case Studies',
}
