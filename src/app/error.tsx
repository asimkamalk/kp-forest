"use client";

import { useEffect } from "react";
import { StatusPageContent } from "@/components/site/status-page-content";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-full flex-1 flex-col bg-paper">
      <StatusPageContent
        eyebrow="Error"
        title="Something went wrong"
        body="We could not finish loading this page. Try again, or go back to a main section of the site."
        action={
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
          >
            Try again
          </button>
        }
      />
    </main>
  );
}
