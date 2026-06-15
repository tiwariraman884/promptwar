import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://promptwar-orpin.vercel.app";

const routes = [
  "/",
  "/auth",
  "/dashboard",
  "/calculator",
  "/tips",
  "/community",
  "/profile",
  "/ai-coach",
  "/scanner",
  "/eco-store",
  "/green-map",
  "/offsets",
  "/onboarding",
  "/settings",
  "/settings/profile",
  "/settings/language",
  "/settings/notifications",
  "/settings/appearance",
  "/settings/privacy",
  "/settings/sessions",
  "/settings/notifications-list",
  "/history",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1.0 : route === "/dashboard" ? 0.9 : 0.7,
  }));
}
