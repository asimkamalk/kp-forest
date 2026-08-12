import Link from "next/link";

export default function ProjectsNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="eyebrow text-resin">Not found</p>
      <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] text-bark">
        Project not found
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-moss">
        This project is missing or has not been published.
      </p>
      <Link
        href="/projects/ongoing"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
      >
        Browse ongoing projects
      </Link>
    </div>
  );
}
