import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/adapter-neon",
    "@neondatabase/serverless",
    "ws",
  ],
  // Calendário e Psicologia saíram do portal (out/2026) — links antigos voltam ao início
  async redirects() {
    return [
      { source: "/calendario", destination: "/inicio", permanent: false },
      { source: "/psicologia", destination: "/inicio", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
