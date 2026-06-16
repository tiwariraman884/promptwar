"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowUpRight, Leaf, ShieldCheck } from "lucide-react";
import { featurePages } from "@/lib/v2-data";

export default function LandingPage() {
  const [startHref, setStartHref] = useState("/onboarding");
  const router = useRouter();

  useEffect(() => {
    const user = window.localStorage.getItem("eco_user");
    if (!user) {
      router.replace("/auth");
      return;
    }
    const onboarding = window.localStorage.getItem("greenstep-onboarding");
    setStartHref(onboarding ? "/dashboard" : "/onboarding");
  }, [router]);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-gray-900 dark:bg-forest-deep dark:text-white">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative grid min-h-screen place-items-center px-4 py-10">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/eco-hero-bg.png')" }}
        />
        {/* Cinematic overlay */}
        <div className="absolute inset-0 cinematic-overlay" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Floating logo */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
            className="grid h-28 w-28 place-items-center rounded-full bg-emerald-100 dark:bg-accent/20 backdrop-blur-sm border border-emerald-300 dark:border-accent/30 shadow-lg dark:shadow-glow"
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              alt="GreenStep India leaf logo"
              className="h-16 w-16"
              src="/icons/leaf-logo.svg"
              width={64}
              height={64}
              priority
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 font-heading text-4xl font-extrabold leading-tight text-gray-900 sm:text-6xl dark:text-white"
            initial={{ opacity: 0, y: 14 }}
          >
            <span className="text-emerald-600 dark:text-accent">Green</span>Step India
          </motion.h1>

          {/* Tagline */}
          <p className="mt-4 text-xl font-bold text-gray-600 dark:text-white/80">
            Track. Reduce. <span className="text-emerald-600 dark:text-accent">Thrive.</span>
          </p>

          {/* Description */}
          <p className="mt-5 max-w-xl text-sm leading-6 text-gray-500 dark:text-text-muted">
            India emits 2.07t CO2 per person/year. GreenStep helps Indian households
            understand daily choices, earn eco-coins, and act without guilt.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={startHref as Route}
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
        {featurePages.slice(1, 5).map((feature, i) => (
          <Link
            className="glass-card card-hover-glow p-5 group"
            href={feature.href as Route}
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
