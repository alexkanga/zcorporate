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
  // Allow cross-origin requests from preview panel
  allowedDevOrigins: [
    '.space.z.ai',
    'localhost',
  ],
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
