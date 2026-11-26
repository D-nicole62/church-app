import type { NextConfig } from "next";

function contentSecurityPolicy() {
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";
  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: https://*.supabase.co"
    : "connect-src 'self' https://*.supabase.co";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com",
    "font-src 'self'",
    connectSrc,
    "media-src 'self' blob: https:",
    "frame-src https://www.youtube-nocookie.com https://maps.google.com https://www.google.com",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ].join("; ");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
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
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
        ],
      },
    ];
  },
};

export default nextConfig;
