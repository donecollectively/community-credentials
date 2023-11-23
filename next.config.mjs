import withMarkdoc from "@markdoc/next.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: "standalone",
    basePath: '/community-credentials',
    // trailingSlash: true,
    pageExtensions: ["js", "jsx", "tsx", "md"],
    experimental: {
        scrollRestoration: true,
        esmExternals: "loose",
    },
    images: {
        unoptimized: true,
    },

    rewrites: async () => [
        { source: '/community-credentials/certifications/', destination: '/community-credentials/certifications' },
        { source: '/certifications/', destination: '/certifications' }
    ],
    
    webpack: (config, options) => {
        const { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack } =
            options;

        config.resolve.alias = {
            ...config.resolve.alias,
            // your aliases
            "@": path.join(__dirname, 'src/')
        };

        config.resolve.extensionAlias = {
            ...config.resolve.extensionAlias,
            ".js": [".ts", ".tsx", ".jsx", ".js"],
            ".jsx": [".tsx", ".jsx"],
            ".mjs": [".mts", ".mjs"],
            ".cjs": [".cts", ".cjs"],
        };

        config.module.rules.push({
            test: /\.hl/,
            type: "asset/source",
        });

        return config;
    },
};

export default withMarkdoc()(nextConfig);
