import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/giving", destination: "/give", permanent: true },
      { source: "/donate", destination: "/give", permanent: true },
      { source: "/plan-your-visit", destination: "/visit", permanent: true },
      { source: "/live", destination: "/sermons", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
