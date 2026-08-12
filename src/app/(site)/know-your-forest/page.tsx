import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { KnowYourForestGrid } from "@/components/site/know-your-forest/article-grid";
import { getKnowYourForestArticles } from "@/lib/data/site";

export default async function KnowYourForestPage() {
  const articles = await getKnowYourForestArticles();

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
              <li className="font-medium text-bark">Know your forest</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">Learn</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            Know your forest
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
            Guides to the trees, habitats and working practices of Khyber Pakhtunkhwa&apos;s
            forests.
          </p>
          <p className="mt-4">
            <Link
              href="/wildlife"
              className="text-sm font-medium text-deodar underline-offset-4 hover:underline"
            >
              Browse wildlife species
            </Link>
          </p>
        </Reveal>

        <KnowYourForestGrid articles={articles} />
      </div>
    </main>
  );
}
