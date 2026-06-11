"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-extrabold text-primary-dark dark:text-white">
        Something paused unexpectedly
      </h1>
      <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-white/65">
        Your data is still safe. Try again, and GreenStep will pick up from here.
      </p>
      <Button className="mt-5" onClick={reset} type="button">
        <RefreshCw aria-hidden size={18} />
        Try again
      </Button>
    </div>
  );
}
