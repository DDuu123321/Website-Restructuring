/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow images from the CMS upload domain (Payload Media)
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',         port: '3001', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cms.bluven.com.au', pathname: '/uploads/**' },
    ],
  },

  // Security response headers.
  //
  // These live here rather than only in netlify.toml because Netlify's Next.js
  // runtime serves SSR/ISR pages from its own function and does NOT apply the
  // toml [[headers]] block to those responses (verified in production: only
  // Netlify's own defaults came through). Next applies these to every response
  // it renders, so both static and dynamic pages are covered.
  //
  // No CSP yet: the app relies on inline styles and Next's inline bootstrap
  // scripts, so a policy worth having needs nonce plumbing — tracked separately
  // rather than shipped as a permissive placeholder.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
    ]
  },

  // Proxy /api and /admin to the Payload CMS backend during development.
  // In production, the CMS is deployed separately and we hit it via NEXT_PUBLIC_CMS_URL.
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return []
    const cms = process.env.CMS_URL || 'http://localhost:3001'
    return [
      { source: '/api/:path*',     destination: `${cms}/api/:path*` },
      { source: '/admin/:path*',   destination: `${cms}/admin/:path*` },
      { source: '/uploads/:path*', destination: `${cms}/uploads/:path*` },
    ]
  },
}

export default nextConfig
