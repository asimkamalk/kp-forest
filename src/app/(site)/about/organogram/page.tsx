import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { OrganogramTree } from "@/components/site/about/organogram-tree";
import { getOrganogram } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Organogram | About",
  description:
    "Departmental hierarchy from the Secretary through regions, circles and divisions.",
};

export default async function OrganogramPage() {
  const tree = await getOrganogram();

  return (
    <main className="flex-1 bg-paper py-12 md:py-20 print:py-6">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal className="print:hidden">
          <nav aria-label="Breadcrumb" className="text-sm text-moss">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="transition-colors hover:text-deodar">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/about" className="transition-colors hover:text-deodar">
                  About
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">Organogram</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">About</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Organogram
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Secretary, Chief Conservator, then the three regions with their circles and
            divisions. Open a node to walk the tree; print for a full chart.
          </p>
        </Reveal>

        <div className="mt-10 hidden print:block">
          <p className="font-mono text-xs uppercase tracking-wider text-moss">
            Forest Department, Khyber Pakhtunkhwa
          </p>
          <h1 className="mt-2 font-display text-3xl text-bark">Organogram</h1>
        </div>

        <div className="mt-10">
          <OrganogramTree tree={tree} />
        </div>
      </div>
    </main>
  );
}
