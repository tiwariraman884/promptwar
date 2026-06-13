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
  experimental: {
    typedRoutes: true
  }
};

module.exports = withPWA(nextConfig);
