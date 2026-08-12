"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { ProjectsTabs } from "@/components/site/projects/projects-tabs";

const LIST_PATHS = new Set([
  "/projects/ongoing",
  "/projects/completed",
  "/projects/future",
]);

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isList = LIST_PATHS.has(pathname);

  if (!isList) {
    return <main className="flex-1 bg-paper">{children}</main>;
  }

  return (
    <main className="flex-1 bg-paper py-16 md:py-24">
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
              <li className="font-medium text-bark">Projects</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Projects</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Forest programmes
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Completed, ongoing and planned work across the three forest regions.
          </p>
        </Reveal>
        <div className="mt-10">
          <ProjectsTabs />
        </div>
        {children}
      </div>
    </main>
  );
}
