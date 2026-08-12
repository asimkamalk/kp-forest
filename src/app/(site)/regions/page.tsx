import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { RegionsSection } from "@/components/site/regions-section";

export const metadata = {
  title: "KP Forest Regions",
  description:
    "Three forest regions of Khyber Pakhtunkhwa — Central Southern, Northern and Malakand.",
};

export default function RegionsPage() {
  return (
    <main className="flex-1">
      <section className="bg-bark px-6 py-16 text-paper md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <nav aria-label="Breadcrumb" className="text-sm text-moss">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <Link href="/" className="transition-colors hover:text-resin">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-mist">Regions</li>
              </ol>
            </nav>
            <p className="eyebrow mt-8 text-resin">Organisation</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-paper">
              KP Forest Regions
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist">
              Explore the three regions that organise forest administration across the province.
            </p>
          </Reveal>
        </div>
      </section>
      <RegionsSection />
    </main>
  );
}
