/**
 * app/page.tsx — Server Component (no 'use client')
 *
 * LCP FIX: By removing 'use client' the h1 + hero content renders
 * directly in the server HTML — browser paints it before any JS runs.
 * Element Render Delay goes from 16s → ~0ms.
 *
 * The localStorage redirect is isolated in LandingRedirect (client),
 * which renders null and fires after hydration — never blocks paint.
 */

// Phase 7B: ISR — cache homepage HTML for 5 minutes at CDN edge.
// Repeat visitors get instant pre-rendered HTML, no server round-trip.
export const revalidate = 300;

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Leaf, ShieldCheck } from "lucide-react";
import { featurePages } from "@/lib/v2-data";
import LandingRedirect from "@/components/LandingRedirect";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-gray-900 dark:bg-forest-deep dark:text-white">
      {/*
        LandingRedirect — client component, renders null.
        Handles localStorage auth check AFTER the page has painted.
        Does NOT block LCP.
      */}
      <LandingRedirect />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative grid min-h-screen place-items-center px-4 py-10">
        {/*
          FIX 1A + 8A: Replace CSS background-image with next/image.
          - priority={true} emits <link rel="preload"> in <head>
          - <img> tag is visible to the browser preload scanner (CSS bg-image is not)
          - Eliminates 100% of image discovery delay
        */}
        <Image
          src="/images/eco-hero-bg.webp"
          alt="Green hills of Haridwar — Clean India"
          fill
          priority={true}
          quality={80}
          sizes="100vw"
          className="object-cover object-center -z-10"
        />

        {/* Cinematic overlay */}
        <div className="absolute inset-0 cinematic-overlay -z-[5]" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Floating logo */}
          <div className="animate-float grid h-28 w-28 place-items-center rounded-full bg-emerald-100 dark:bg-accent/20 backdrop-blur-sm border border-emerald-300 dark:border-accent/30 shadow-lg dark:shadow-glow">
            <Image
              alt="GreenStep India leaf logo"
              className="h-16 w-16"
              src="/icons/leaf-logo.svg"
              width={64}
              height={64}
              priority
            />
          </div>

          {/*
            FIX 1B: h1 is now server-rendered — paints immediately.
            Previously it waited for 'use client' hydration (16s on 3G).
          */}
          <h1 className="animate-fade-up mt-8 font-heading text-4xl font-extrabold leading-tight text-gray-900 sm:text-6xl dark:text-white">
            <span className="text-emerald-600 dark:text-accent">Green</span>Step India
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-xl font-bold text-gray-600 dark:text-white/80">
            Track. Reduce. <span className="text-emerald-600 dark:text-accent">Thrive.</span>
          </p>

          {/* Description */}
          <p className="mt-5 max-w-xl text-sm leading-6 text-gray-500 dark:text-text-muted">
            India emits 2.07t CO2 per person/year. GreenStep helps Indian households
            understand daily choices, earn eco-coins, and act without guilt.
          </p>

          {/* CTA Buttons — static hrefs, no dynamic state needed for first paint */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="btn-primary-gradient inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-2.5 text-sm font-bold shadow-glow transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-0.5"
            >
              Get started
              <ArrowUpRight aria-hidden size={18} />
            </Link>
            <Link
              href="/dashboard"
              className="btn-glass inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-2.5 text-sm font-bold"
            >
              View demo
              <ShieldCheck aria-hidden size={18} />
            </Link>
          </div>
        </div>

        {/* Bottom badge */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase text-gray-400 dark:text-white/40">
          <Leaf aria-hidden size={14} className="text-accent/60" />
          Full carbon PWA for Haridwar, Uttarakhand, and India
        </div>
      </section>

      {/* ═══ FEATURE CARDS ═══ */}
      <section className="mx-auto grid max-w-6xl gap-3 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        {featurePages.slice(1, 5).map((feature) => (
          <Link
            className="glass-card card-hover-glow p-5 group"
            href={feature.href as any}
            key={feature.href}
          >
            <p className="text-xs font-bold uppercase text-accent">
              {feature.page}
            </p>
            <h2 className="mt-2 font-heading text-lg font-extrabold text-gray-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-accent transition-colors duration-300">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-text-muted">
              {feature.summary}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
