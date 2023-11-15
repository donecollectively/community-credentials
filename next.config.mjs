import withMarkdoc from "@markdoc/next.js"

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: "standalone",
    pageExtensions: ["js", "jsx", "tsx", "md"],
    experimental: {
        scrollRestoration: true,
        esmExternals: 'loose',
    },
    images: {
        unoptimized: true,
    },

    webpack: (config, options) => {
        const { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack } =
            options

        config.resolve.extensionAlias = {
            ...config.resolve.extensionAlias,
            ".js": [".ts", ".tsx", ".jsx", ".js"],
            ".jsx": [".tsx", ".jsx"],
            '.mjs': ['.mts', '.mjs'],
            '.cjs': ['.cts', '.cjs'],
        }

        config.module.rules.push({
            test: /\.hl/,
            type: "asset/source",
        })

        return config
    },
}

export default withMarkdoc()(nextConfig)