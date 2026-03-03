import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./next-intl.config.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Serve static files from /upload folder
  async rewrites() {
    return [
      {
        source: '/upload/:path*',
        destination: '/api/serve-upload/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
