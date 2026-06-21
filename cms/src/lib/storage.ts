// Single source of truth for "is Cloudflare R2 object storage configured?".
// Imported by payload.config.ts (registers the cloud-storage plugin), Media.ts
// (disables local-disk writes) and server.ts (skips the local /uploads handler).
// When any R2_* var is missing — e.g. local dev — this is false and Payload
// falls back to local-disk uploads, so nothing changes locally.
export const r2Enabled = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
)
