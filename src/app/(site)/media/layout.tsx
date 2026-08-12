"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { MediaTabs } from "@/components/site/media/media-tabs";

const LIST_PATHS = new Set([
  "/media/press-releases",
  "/media/photos",
  "/media/videos",
  "/media/news",
]);

export default function MediaLayout({ children }: { children: ReactNode }) {
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
              <li className="font-medium text-bark">Media</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Media gallery</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            News and visuals
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Press releases, photo albums, videos and external news coverage from
            the Forest Department.
          </p>
        </Reveal>
        <div className="mt-10">
          <MediaTabs />
        </div>
        {children}
      </div>
    </main>
  );
}
