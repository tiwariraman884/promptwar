import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/callback"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://promptwar-orpin.vercel.app"}/sitemap.xml`,
  };
}
