"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  href?: string;
}

export default function Logo({ size = "md", variant = "full", href }: LogoProps) {
  const sizes = { sm: 28, md: 44, lg: 52 };
  const s = sizes[size];
  const textSizes = { sm: "text-sm", md: "text-xl", lg: "text-2xl" };
  const subSizes = { sm: "text-[7px]", md: "text-[10px]", lg: "text-[11px]" };

  const logo = (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Logo icon */}
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="GreenStep India"
          width={s}
          height={s}
          className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-[#52B788]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {variant === "full" && (
        <div className={`flex flex-col leading-none gap-0.5 ${textSizes[size]}`}>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#52B788] dark:from-white dark:via-[#B7E4C7] dark:to-[#52B788] bg-clip-text text-transparent">
            GreenStep
          </span>
          <span className={`${subSizes[size]} font-bold tracking-[0.2em] uppercase text-[#52B788]/80 dark:text-[#52B788]/70`}>
            India • Eco Platform
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
