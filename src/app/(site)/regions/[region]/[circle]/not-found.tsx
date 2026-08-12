"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function CircleNotFound() {
  const params = useParams<{ region?: string }>();
  const href = params.region ? `/regions/${params.region}` : "/regions";

  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-6 py-24">
      <div className="max-w-md text-center">
        <p className="eyebrow text-resin">Not found</p>
        <h1 className="mt-3 font-display text-2xl text-bark">Circle not found</h1>
        <p className="mt-3 text-sm text-moss">
          This circle is missing, unpublished, or does not belong to this region.
        </p>
        <Link
          href={href}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
        >
          Back to region
        </Link>
      </div>
    </main>
  );
}
