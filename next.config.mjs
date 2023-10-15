import withMarkdoc from "@markdoc/next.js"


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

  webpack: (config, options) => {
    const { 
        buildId, dev, isServer, 
        defaultLoaders, nextRuntime, webpack
     } = options
    config.module.rules.push({
      test: /\.hl/,
      type: 'asset/source',
    })
 
    return config
  },

}

export default  withMarkdoc()(nextConfig)
