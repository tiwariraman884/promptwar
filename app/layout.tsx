import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/app/providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://promptwar-orpin.vercel.app"
  ),
  title: {
    default: "GreenStep India",
    template: "%s | GreenStep India"
  },
  description:
    "India-first carbon footprint tracker — log daily emissions, earn eco-coins, and reduce your impact. Built for Haridwar, Uttarakhand and beyond.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "GreenStep"
  },
  keywords: [
    "carbon footprint",
    "India",
    "sustainability",
    "eco tracker",
    "CO2",
    "Haridwar",
    "Uttarakhand",
    "green living",
    "climate action",
  ],
  openGraph: {
    type: "website",
    siteName: "GreenStep India",
    title: "GreenStep India — Track. Reduce. Thrive.",
    description:
      "India-first carbon footprint tracker for daily emissions, eco-coins, and sustainable living.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "GreenStep India logo" }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenStep India — Track. Reduce. Thrive.",
    description: "India-first carbon footprint tracker for daily emissions and eco-coins.",
    images: ["/icons/icon-512.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#1C2F2D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${dmSans.variable} ${plusJakarta.variable} dark`}>
      <head>
        {/* ── Phase 8A: Preload LCP hero image — browser fetches before HTML parsed ── */}
        <link
          rel="preload"
          as="image"
          href="/images/eco-hero-bg.webp"
          type="image/webp"
        />

        {/* ── Phase 6: Preconnect to critical origins ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />

        {/* ── Phase 4B: Inline critical CSS — styles LCP element without file download ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Hero section critical path */
          .hero-section{position:relative;min-height:100svh;display:grid;place-items:center;padding:2.5rem 1rem;overflow:hidden}
          .hero-title{font-size:clamp(2rem,6vw,3.75rem);font-weight:800;line-height:1.1;letter-spacing:-0.02em;color:#fff}
          .hero-subtitle{font-size:1.25rem;font-weight:700;color:rgba(255,255,255,0.8);margin-top:1rem}
          .hero-desc{font-size:.875rem;line-height:1.625;color:rgba(255,255,255,0.6);max-width:36rem;margin-top:1.25rem}
          /* Prevent layout shift */
          *{box-sizing:border-box}
          body{margin:0;font-family:var(--font-body,system-ui,sans-serif)}
          /* Background color while image loads — no flash of white */
          .hero-bg-fallback{background-color:#0a1f14}
        ` }} />

        {/* Theme detection: localStorage > system preference > dark default */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=window.matchMedia('(prefers-color-scheme:dark)').matches!==false;document.documentElement.classList.toggle('dark',d);}catch(e){document.documentElement.classList.add('dark')}})();`,
          }}
        />
      </head>
      <body className={`${dmSans.className}`} suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
