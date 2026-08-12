import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import {
  getProjectBySlug,
  getPublishedProjectSlugs,
} from "@/lib/data/site";
import {
  PROJECT_STATUS_LABELS,
  formatDateRange,
  formatPkr,
} from "@/lib/validators/project";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rows = await getPublishedProjectSlugs();
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} | Projects`,
    description: project.summary ?? undefined,
    openGraph: {
      title: project.title,
      description: project.summary ?? undefined,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

function ownerLink(project: NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>) {
  if (project.division) {
    const { circle } = project.division;
    const { region } = circle;
    return {
      href: `/regions/${region.slug}/${circle.slug}/${project.division.slug}`,
      label: `${project.division.name} · ${circle.name} · ${region.name}`,
    };
  }
  if (project.circle) {
    const { region } = project.circle;
    return {
      href: `/regions/${region.slug}/${project.circle.slug}`,
      label: `${project.circle.name} · ${region.name}`,
    };
  }
  if (project.region) {
    return {
      href: `/regions/${project.region.slug}`,
      label: project.region.name,
    };
  }
  return null;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const owner = ownerLink(project);
  const pct = Math.min(100, Math.max(0, project.progressPct));
  const paragraphs = (project.description ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const statusHref =
    project.projectStatus === "COMPLETED"
      ? "/projects/completed"
      : project.projectStatus === "FUTURE"
        ? "/projects/future"
        : "/projects/ongoing";

  return (
    <article className="py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-sm text-moss">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="transition-colors hover:text-deodar">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={statusHref} className="transition-colors hover:text-deodar">
                  Projects
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">{project.title}</li>
            </ol>
          </nav>
        </Reveal>

        {project.coverImage && (
          <Reveal className="mt-8">
            <div
              className="relative aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-mist"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
            >
              <Image
                src={project.coverImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        <Reveal className="mt-10 max-w-3xl">
          <span className="inline-flex rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
            {PROJECT_STATUS_LABELS[project.projectStatus]}
          </span>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            {project.title}
          </h1>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-moss">
            <span>{formatPkr(project.costPkr)}</span>
            <span>{formatDateRange(project.startDate, project.endDate)}</span>
            {project.fundingSource && <span>{project.fundingSource}</span>}
          </p>

          {project.projectStatus === "ONGOING" && (
            <div className="mt-6 max-w-md">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-moss">Progress</span>
                <span className="data font-mono text-xs tabular-nums text-bark">{pct}%</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-mist"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-resin" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {project.summary && (
            <p className="mt-6 text-base leading-relaxed text-moss">{project.summary}</p>
          )}
        </Reveal>

        {paragraphs.length > 0 && (
          <Reveal className="mt-10 max-w-3xl">
            <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-bark prose-p:font-sans prose-p:leading-relaxed prose-p:text-bark/90">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal className="mt-10 flex flex-wrap gap-4">
          {owner && (
            <Link
              href={owner.href}
              className="inline-flex h-10 items-center rounded-[8px] border border-mist px-4 text-sm font-medium text-bark hover:bg-mist/40"
            >
              {owner.label}
            </Link>
          )}
          {project.documentUrl && (
            <a
              href={project.documentUrl}
              download
              className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper hover:bg-bark"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download document
            </a>
          )}
        </Reveal>
      </div>
    </article>
  );
}
