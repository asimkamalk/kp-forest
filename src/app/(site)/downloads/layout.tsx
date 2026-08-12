import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { DownloadsTabs } from "@/components/site/downloads/downloads-tabs";

export default function DownloadsLayout({ children }: { children: ReactNode }) {
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
              <li className="font-medium text-bark">Downloads</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Downloads</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Documents &amp; publications
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Official publications, notifications, acts, rules and policies issued by the
            Forest Department.
          </p>
        </Reveal>

        <div className="mt-10">
          <DownloadsTabs />
        </div>

        {children}
      </div>
    </main>
  );
}
