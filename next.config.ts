// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "inokcdrlfrmjjjhbgdvx.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.com" },
    ],
  },

  compiler: {
    removeConsole: isProd,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { 
            key: "Content-Security-Policy", 
            value: isProd 
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https: https://*.tile.openstreetmap.org https://*.openstreetmap.org https://nominatim.openstreetmap.org https://cdnjs.cloudflare.com https://*.basemaps.cartocdn.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.supabase.com https://*.tile.openstreetmap.org https://*.openstreetmap.org https://nominatim.openstreetmap.org https://cdnjs.cloudflare.com https://*.basemaps.cartocdn.com wss://*.supabase.co; worker-src 'self' blob:; child-src 'self' blob:; frame-ancestors 'none';"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https: https://*.tile.openstreetmap.org https://*.openstreetmap.org https://nominatim.openstreetmap.org https://cdnjs.cloudflare.com https://*.basemaps.cartocdn.com; font-src 'self' data:; connect-src 'self' 'self' https://*.supabase.co https://*.supabase.com https://inokcdrlfrmjjjhbgdvx.supabase.co https://*.tile.openstreetmap.org https://*.openstreetmap.org https://nominatim.openstreetmap.org https://cdnjs.cloudflare.com wss://*.supabase.co wss: blob:; worker-src 'self' blob:; child-src 'self' blob:; frame-ancestors 'none';"
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
      {
        source: "/",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },

  env: {
    SITE_NAME: 'Safety News App',
    SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : `http://localhost:${process.env.PORT ?? 3000}`,
  },
};

export default nextConfig;
