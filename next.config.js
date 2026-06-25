const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

let withPWA;
try {
  withPWA = require("next-pwa")({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 8,
            maxAgeSeconds: 365 * 24 * 60 * 60
          }
        }
      },
      {
        urlPattern: /^https?.*\/data\/emission-factors\.json$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "emission-factors",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 30 * 24 * 60 * 60
          }
        }
      },
      {
        urlPattern: /^https?.*\/(?:calculator|tips)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "offline-core-pages",
          expiration: {
            maxEntries: 12,
            maxAgeSeconds: 7 * 24 * 60 * 60
          }
        }
      },
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "navigation",
          networkTimeoutSeconds: 4,
          expiration: {
            maxEntries: 40,
            maxAgeSeconds: 24 * 60 * 60
          }
        }
      }
    ]
  });
} catch (e) {
  console.warn("⚠ next-pwa failed to load, PWA features disabled:", e.message);
  withPWA = (config) => config;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  compress: true,

  // ── Compiler optimizations ──────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ── Experimental: faster builds + smaller output ────────
  experimental: {
    typedRoutes: true,
    scrollRestoration: true,
    optimizePackageImports: [
      'recharts',
      'framer-motion',
      'lucide-react',
      '@heroicons/react',
      'date-fns',
      'lodash',
    ],
  },

  // ── Image optimization ──────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 768, 1024, 1280],
    minimumCacheTTL: 31536000, // 1-year cache
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },
      { protocol: 'https', hostname: '*.googleapis.com' },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Headers: caching + security ─────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://app.posthog.com https://maps.googleapis.com https://world.openfoodfacts.org",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // Phase 7C: Homepage — serve cached for 5min, revalidate in background
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=3600' }],
      },
      {
        // Dashboard is user-specific — never CDN-cached
        source: '/dashboard/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-cache, no-store' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/workers/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
