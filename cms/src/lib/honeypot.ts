/**
 * Honeypot spam trap for public lead forms.
 *
 * The frontend renders a visually-hidden `hp` input that real users never see or
 * fill. Naive form-filling bots populate every field, including this one. If a
 * public (unauthenticated) submission arrives with `hp` set, it's a bot — reject.
 *
 * This complements (does not replace) the per-IP rate limit and field validators;
 * HTTP-level spammers that forge requests directly won't send `hp`, so they're
 * caught by rate limiting + validation instead.
 */
import type { Field } from 'payload/types'

export const honeypotField: Field = {
  name: 'hp',
  type: 'text',
  label: 'Leave this field empty',
  maxLength: 100,
  admin: { hidden: true },
  access: {
    // Never expose stored values back through the API.
    read: () => false,
  },
}

/** Throw inside a create beforeChange hook when the honeypot is tripped. */
export function assertNotBot(data: any, user: unknown): void {
  if (!user && data?.hp) {
    throw new Error('Submission rejected.')
  }
}
