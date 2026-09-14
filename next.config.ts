import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Fleet photography is still served from the legacy media library.
    remotePatterns: [
      { protocol: 'https', hostname: 'luxmotorsdxb.com', pathname: '/wp-content/uploads/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
