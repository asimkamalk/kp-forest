import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getFeaturedProjects } from "@/lib/data/site";

function formatPkr(value: number | null) {
  if (value == null) return null;
  return `PKR ${value.toLocaleString("en-GB")}`;
}

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects();

  return (
    <section
      aria-labelledby="featured-projects-heading"
      className="bg-paper py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-resin">Projects</p>
              <h2
                id="featured-projects-heading"
                className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] text-bark"
              >
                Ongoing work
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
                Active programmes ranked by progress across the province.
              </p>
            </div>
            <Link
              href="/projects/ongoing"
              className="group inline-flex items-center gap-2 text-sm font-medium text-deodar hover:text-bark"
            >
              View ongoing projects
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>

        {projects.length === 0 ? (
          <p className="mt-10 text-sm text-moss">
            No ongoing projects published yet. They will appear here as work is recorded.
          </p>
        ) : (
          <Stagger className="mt-10 grid gap-6 md:grid-cols-3" gap={0.1}>
            {projects.map((project) => {
              const pct = Math.min(100, Math.max(0, project.progressPct));
              const cost = formatPkr(project.costPkr);
              return (
                <StaggerItem key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-mist bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]"
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
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-xl text-bark">{project.title}</h3>
                      {project.summary && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-moss">
                          {project.summary}
                        </p>
                      )}
                      <div className="mt-auto pt-5">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-moss">Progress</span>
                          <span className="data font-mono text-xs tabular-nums text-bark">
                            {pct}%
                          </span>
                        </div>
                        <div
                          className="h-1.5 overflow-hidden rounded-full bg-mist"
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${project.title} progress`}
                        >
                          <div
                            className="h-full rounded-full bg-resin"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {cost && (
                          <p className="mt-3 font-mono text-xs text-moss">{cost}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </section>
  );
}
