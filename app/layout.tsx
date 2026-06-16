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
        {/* Theme detection: localStorage > system preference > dark default */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('greenstep-theme');var d=t==='light'?false:t==='dark'?true:window.matchMedia('(prefers-color-scheme:dark)').matches!==false;document.documentElement.classList.toggle('dark',d);var l=JSON.parse(localStorage.getItem('eco_language')||'{}');if(l.code){document.documentElement.lang=l.code}}catch(e){document.documentElement.classList.add('dark')}})();`,
          }}
        />
      </head>
      <body className={`${dmSans.className} bg-forest-deep text-text-secondary`} suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
