"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  href?: string;
}

export default function Logo({ size = "md", variant = "full", href }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const s = sizes[size];
  const textSizes = { sm: "text-sm", md: "text-base", lg: "text-lg" };

  const logo = (
    <div className="flex items-center gap-2 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Carbon Footprint Awareness Platform"
        width={s}
        height={s}
        className="shrink-0"
      />

      {variant === "full" && (
        <div className={`flex flex-col leading-none ${textSizes[size]}`}>
          <span className="font-extrabold tracking-tight text-[#1B4332] dark:text-white">
            Carbon Footprint
          </span>
          <span className="text-[0.55em] font-semibold tracking-[0.15em] uppercase text-[#52B788] dark:text-[#52B788]">
            Awareness Platform
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href as any} className="flex items-center">
        {logo}
      </Link>
    );
  }

  return logo;
}
