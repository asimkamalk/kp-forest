"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logClientError } from "@/server/actions/log-error";
import "./globals.css";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Replaces the root layout when it fails. Must render its own <html> and <body>.
 * No next/font here — that CSS is preloaded on every page and unused on success.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    void logClientError({
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      source: "global-error.tsx",
    });
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-paper text-bark">
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <p className="eyebrow text-resin">Error</p>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,4.5rem)] tracking-[-0.02em] leading-[1.02] text-bark">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-moss">
            We could not finish loading this page. Try again, or return home.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-[8px] border border-mist bg-paper px-5 text-sm font-medium text-bark hover:border-deodar hover:bg-mist/40"
            >
              Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
