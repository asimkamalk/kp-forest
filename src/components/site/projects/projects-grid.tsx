"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectStatus } from "@prisma/client";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  PROJECT_STATUS_LABELS,
  formatDateRange,
  formatPkr,
} from "@/lib/validators/project";
import type { PublicProjectCard } from "@/lib/data/site";
import { cn } from "@/lib/utils";

type Props = {
  projects: PublicProjectCard[];
  emptyMessage: string;
  showProgress?: boolean;
};

export function ProjectsGrid({
  projects,
  emptyMessage,
  showProgress = false,
}: Props) {
  const [regionId, setRegionId] = useState("all");

  const regions = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of projects) {
      if (p.regionId && p.regionName) map.set(p.regionId, p.regionName);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [projects]);

  const filtered = useMemo(
    () =>
      regionId === "all"
        ? projects
        : projects.filter((p) => p.regionId === regionId),
    [projects, regionId]
  );

  if (projects.length === 0) {
    return <p className="mt-10 text-sm text-moss">{emptyMessage}</p>;
  }

  return (
    <div className="mt-8 space-y-6">
      {regions.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by region">
          <Chip active={regionId === "all"} onClick={() => setRegionId("all")}>
            All regions
          </Chip>
          {regions.map((r) => (
            <Chip
              key={r.id}
              active={regionId === r.id}
              onClick={() => setRegionId(r.id)}
            >
              {r.name}
            </Chip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-moss">No projects in this region.</p>
      ) : (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
          {filtered.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} showProgress={showProgress} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-[8px] border px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
        active
          ? "border-deodar bg-deodar text-paper"
          : "border-mist bg-paper text-moss hover:border-deodar hover:text-bark"
      )}
    >
      {children}
    </button>
  );
}

function ProjectCard({
  project,
  showProgress,
}: {
  project: PublicProjectCard;
  showProgress: boolean;
}) {
  const pct = Math.min(100, Math.max(0, project.progressPct));

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-mist bg-paper shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div
        className="relative aspect-[16/10] bg-mist"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex w-fit rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
          {PROJECT_STATUS_LABELS[project.projectStatus as ProjectStatus]}
        </span>
        <h2 className="mt-3 font-display text-xl text-bark">{project.title}</h2>
        {project.summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-moss">
            {project.summary}
          </p>
        )}
        <p className="mt-3 font-mono text-xs text-moss">{formatPkr(project.costPkr)}</p>
        <p className="mt-1 font-mono text-xs text-moss">
          {formatDateRange(project.startDate, project.endDate)}
        </p>
        {showProgress && (
          <div className="mt-auto pt-5">
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
      </div>
    </Link>
  );
}
