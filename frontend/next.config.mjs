/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow images from the CMS upload domain (Payload Media)
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',         port: '3001', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      // Add your production CMS domain here:
      // { protocol: 'https', hostname: 'cms.bluven.com.au', pathname: '/uploads/**' },
    ],
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
