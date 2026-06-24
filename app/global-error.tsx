"use client";

/**
 * Global Error Boundary
 *
 * Root-level error boundary that catches unhandled errors in the entire app.
 * This is a Next.js App Router convention — it wraps the entire <html> element.
 *
 * Unlike app/error.tsx (which wraps individual routes), global-error.tsx catches
 * errors in the root layout itself.
 */

import { RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log to console in all environments (structured logger unavailable in client)
  // eslint-disable-next-line no-console
  console.error("[GLOBAL_ERROR]", {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
  });

  return (
    <html lang="en-IN">
      <body className="bg-gray-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            An unexpected error occurred. Your data is safe — this is a display issue.
            {error.digest && (
              <span className="mt-1 block font-mono text-xs text-gray-600">
                Error ID: {error.digest}
              </span>
            )}
          </p>

          <button
            onClick={reset}
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            <RefreshCw size={16} aria-hidden />
            Try again
          </button>

          <a
            href="/dashboard"
            className="mt-3 text-sm text-emerald-400 underline underline-offset-4 hover:text-emerald-300"
          >
            Go to Dashboard
          </a>
        </div>
      </body>
    </html>
  );
}
