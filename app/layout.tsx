import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: {
    default: "GreenStep India",
    template: "%s | GreenStep India"
  },
  description:
    "India-first carbon footprint tracker for Haridwar, Uttarakhand and beyond.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "GreenStep"
  }
};

export const viewport: Viewport = {
  themeColor: "#1D9E75",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Set dark class before React hydrates to prevent mismatch */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('greenstep-theme');if(d==='dark'||(!d&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}try{var l=JSON.parse(localStorage.getItem('eco_language')||'{}');if(l.code){document.documentElement.lang=l.code}}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
