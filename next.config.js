/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@deck.gl/layers'],
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
