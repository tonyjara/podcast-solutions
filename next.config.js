/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
/* await import("./src/env.mjs") */

/** @type {import("next").NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        swcPlugins: [["next-superjson-plugin", {}]],
    },
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
}
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
})
module.exports = withBundleAnalyzer(nextConfig)
