"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { featurePages } from "@/lib/v2-data";

export default function LandingPage() {
  const [startHref, setStartHref] = useState("/onboarding");
  const router = useRouter();

  // AUTH GATE (RULE 1): Root "/" must redirect unauthenticated users to /auth.
  // This client-side check covers the localStorage-based mock auth flow,
  // since Next.js middleware cannot read localStorage.
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
    <div className="min-h-screen overflow-hidden bg-mist text-ink dark:bg-[#0B1815] dark:text-white">
      <section className="relative grid min-h-[92vh] place-items-center px-4 py-10">
        <img
          alt=""
          className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          src="/icons/icon-512.png"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
            className="grid h-28 w-28 place-items-center rounded-full bg-primary text-white shadow-soft"
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              alt=""
              className="h-16 w-16"
              src="/icons/leaf-logo.svg"
            />
          </motion.div>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 font-heading text-4xl font-extrabold leading-tight text-primary-dark dark:text-white sm:text-6xl"
            initial={{ opacity: 0, y: 14 }}
          >
            GreenStep India
          </motion.h1>
          <p className="mt-4 text-xl font-bold text-ink/75 dark:text-white/75">
            Track. Reduce. Thrive.
          </p>
          <p className="mt-5 max-w-xl text-sm leading-6 text-ink/65 dark:text-white/65">
            India emits 2.07t CO2 per person/year. GreenStep helps Indian households
            understand daily choices, earn eco-coins, and act without guilt.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href={startHref as any}>
                Get started
                <ArrowUpRight aria-hidden size={18} />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">
                View demo
                <ShieldCheck aria-hidden size={18} />
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase text-ink/45 dark:text-white/45">
          <Leaf aria-hidden size={14} />
          Full carbon PWA for Haridwar, Uttarakhand, and India
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        {featurePages.slice(1, 5).map((feature) => (
          <Link
            className="rounded-card border border-line bg-white p-4 shadow-soft transition hover:border-primary dark:border-white/10 dark:bg-white/[0.04]"
            href={feature.href as any}
            key={feature.href}
          >
            <p className="text-xs font-bold uppercase text-primary-dark dark:text-primary-light">
              {feature.page}
            </p>
            <h2 className="mt-2 font-heading text-lg font-extrabold">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-white/65">
              {feature.summary}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
