import { Leaf, MoveRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel: string;
  href: Route;
};

export function EmptyState({
  title,
  description,
  ctaLabel,
  href
}: EmptyStateProps) {
  return (
    <div className="rounded-card border border-dashed border-primary/30 bg-primary-light/45 p-6 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-primary shadow-soft dark:bg-white/10">
        <Leaf aria-hidden size={28} />
      </div>
      <h2 className="font-heading text-xl font-extrabold text-primary-dark dark:text-white">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/65 dark:text-white/65">
        {description}
      </p>
      <Button asChild className="mt-5">
        <Link href={href}>
          {ctaLabel}
          <MoveRight aria-hidden size={18} />
        </Link>
      </Button>
    </div>
  );
}
