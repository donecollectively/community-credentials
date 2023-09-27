const withMarkdoc = require('@markdoc/next.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'tsx', 'md'],
  experimental: {
    scrollRestoration: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = withMarkdoc()(nextConfig)
