import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { WildlifeGrid } from "@/components/site/wildlife/wildlife-grid";
import { getWildlifeSpecies } from "@/lib/data/site";
import { WILDLIFE_CATEGORIES } from "@/lib/validators/services";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function WildlifePage({ searchParams }: Props) {
  const { category: raw } = await searchParams;
  const species = await getWildlifeSpecies();

  const activeCategory =
    raw &&
    WILDLIFE_CATEGORIES.some((c) => c.toLowerCase() === raw.toLowerCase())
      ? WILDLIFE_CATEGORIES.find((c) => c.toLowerCase() === raw.toLowerCase()) ?? null
      : null;

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
              <li className="font-medium text-bark">Wildlife</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Learn</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Wildlife
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Species recorded across Khyber Pakhtunkhwa&apos;s forests and protected habitats.
          </p>
          <p className="mt-4">
            <Link
              href="/know-your-forest"
              className="text-sm font-medium text-deodar underline-offset-4 hover:underline"
            >
              Read know your forest guides
            </Link>
          </p>
        </Reveal>

        <WildlifeGrid species={species} activeCategory={activeCategory} />
      </div>
    </main>
  );
}
