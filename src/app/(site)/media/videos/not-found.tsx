import Link from "next/link";

export default function VideosNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="eyebrow text-resin">Not found</p>
      <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] text-bark">
        Video not found
      </h2>
      <Link
        href="/media/videos"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
      >
        All videos
      </Link>
    </div>
  );
}
