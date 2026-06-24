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

  // ── Performance: SWC minification ──
  swcMinify: true,

  // ── Performance: HTTP compression ──
  compress: true,

  // ── Performance: strip console.* in production ──
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ── Performance: image optimization for India 3G/4G ──
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 768, 1024, 1280],
    minimumCacheTTL: 86400, // 24-hour cache
  },

  // ── ESLint: run via `npm run lint` separately, skip during build ──
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    typedRoutes: true,
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
    scrollRestoration: true,
  },

  async headers() {
    return [
      // ── Security headers (all routes) ──
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
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
      // ── Performance: immutable cache for static assets ──
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
