import type { NextConfig } from "next";

const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.8.14',
    '192.168.8.14:3000',
    '192.168.8.152',
    '192.168.8.152:3000',
    'alshbili:3000',
    'alshbili.local:3000',
    'localhost:3000',
    '127.0.0.1:3000'
  ],
  output: isExport ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
