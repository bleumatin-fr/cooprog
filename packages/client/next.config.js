/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config.js");
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  output: "standalone",
  i18n,
  reactStrictMode: true,
  transpilePackages: ["@cooprog/core", "@mui/x-data-grid"],
  experimental: {
    esmExternals: true,
  },
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: false,
  },
};

const sentryWebpackPluginOptions = {
  // https://github.com/getsentry/sentry-webpack-plugin#options.
  url: process.env.SENTRY_URL,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: process.env.NEXT_PUBLIC_COMMIT_SHA,
  silent: true, // Suppresses all logs
};

module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
