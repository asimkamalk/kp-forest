import Link from "next/link";

export default function KnowYourForestDetailNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-6 py-24">
      <div className="max-w-md text-center">
        <p className="eyebrow text-resin">Not found</p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] text-bark">
          Article not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-moss">
          This guide is missing or has not been published.
        </p>
        <Link
          href="/know-your-forest"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
        >
          Browse know your forest
        </Link>
      </div>
    </main>
  );
}
