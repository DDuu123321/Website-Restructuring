/**
 * Server-side validators for public lead fields.
 *
 * The website forms validate on the client, but the REST endpoints are public
 * (`create: () => true`) — anyone can POST straight to /api/quotes etc. and skip
 * the browser entirely. These run on every create so malformed/garbage/injection
 * payloads are rejected at the API boundary too.
 *
 * Deliberately LENIENT: the goal is to block spam and obviously-bad input, not to
 * reject a real customer. A lost lead costs more than a junk row — when in doubt,
 * let it through (the engineer calls back anyway). A custom `validate` replaces
 * Payload's built-in required check, so each factory takes a `required` flag.
 */
import type { Validate } from 'payload/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const auEmail = (required = false): Validate => (val) => {
  const v = typeof val === 'string' ? val.trim() : ''
  if (!v) return required ? 'Email is required.' : true
  return EMAIL_RE.test(v) || 'Please enter a valid email address.'
}

export const auPhone = (required = false): Validate => (val) => {
  const v = typeof val === 'string' ? val.trim() : ''
  if (!v) return required ? 'Phone is required.' : true
  const digits = v.replace(/[\s()+\-.]/g, '')
  return /^\d{8,15}$/.test(digits) || 'Please enter a valid phone number.'
}

export const auPostcode = (required = false): Validate => (val) => {
  const v = typeof val === 'string' ? val.trim() : ''
  if (!v) return required ? 'Postcode is required.' : true
  return /^\d{4}$/.test(v) || 'Australian postcodes are 4 digits.'
}
