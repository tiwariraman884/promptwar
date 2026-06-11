import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-extrabold text-primary-dark dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 text-sm leading-6 text-ink/65 dark:text-white/65">
        The page may have moved, but your next small climate step is close by.
      </p>
      <Button asChild className="mt-5">
        <Link href="/dashboard">
          <MoveLeft aria-hidden size={18} />
          Dashboard
        </Link>
      </Button>
    </div>
  );
}
