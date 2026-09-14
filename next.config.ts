import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // All fleet photography is served from public/fleet, so no remote hosts are
    // allowed. Adding one here would let the site hotlink again by accident.
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
