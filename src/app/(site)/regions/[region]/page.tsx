import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { RegionMap } from "@/components/site/region-map";
import {
  getPublishedRegionSlugs,
  getRegionWithCircles,
} from "@/lib/data/site";

type Props = {
  params: Promise<{ region: string }>;
};

export async function generateStaticParams() {
  const rows = await getPublishedRegionSlugs();
  return rows.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug } = await params;
  const region = await getRegionWithCircles(slug);
  if (!region) return { title: "Region not found" };
  return {
    title: region.seoTitle ?? region.name,
    description: region.seoDescription ?? region.shortDesc ?? undefined,
  };
}

export default async function RegionDetailPage({ params }: Props) {
  const { region: slug } = await params;
  const region = await getRegionWithCircles(slug);
  if (!region) notFound();

  const mapGeoJson = region.mapGeoJson;

  return (
    <main className="flex-1">
      <section className="bg-bark px-6 py-14 text-paper md:py-20">
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
                <li>
                  <Link href="/regions" className="transition-colors hover:text-resin">
                    Regions
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-mist">{region.name}</li>
              </ol>
            </nav>

            <div className="mt-8 flex flex-wrap items-end gap-4">
              <span className="font-display text-5xl leading-none text-mist/40 md:text-6xl">
                {region.code}
              </span>
              <div>
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-paper">
                  {region.name}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-mist">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  Headquarters: {region.headquarters}
                </p>
              </div>
            </div>

            {(region.description || region.shortDesc) && (
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-mist">
                {region.description ?? region.shortDesc}
              </p>
            )}
          </Reveal>

          {mapGeoJson != null && (
            <Reveal delay={0.15} className="mt-10">
              <RegionMap
                geojson={mapGeoJson}
                className="h-64 w-full overflow-hidden rounded-[12px] border border-deodar md:h-80"
              />
            </Reveal>
          )}
        </div>
      </section>

      <section className="bg-paper px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="eyebrow text-resin">Circles</p>
            <h2 className="mt-2 font-display text-2xl text-bark md:text-3xl">
              Forest circles in this region
            </h2>
          </Reveal>

          <Stagger className="mt-10 grid gap-5 md:grid-cols-2" gap={0.08}>
            {region.circles.map((circle) => {
              const preview = circle.divisions.slice(0, 4);
              const more = Math.max(0, circle.divisions.length - preview.length);

              return (
                <StaggerItem key={circle.id}>
                  <Link
                    href={`/regions/${region.slug}/${circle.slug}`}
                    className="group flex h-full flex-col rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl text-bark">{circle.name}</h3>
                      <span className="shrink-0 rounded-[8px] bg-deodar px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-paper">
                        {circle._count.divisions} divisions
                      </span>
                    </div>
                    {circle.headquarters && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-moss">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {circle.headquarters}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {preview.map((d) => (
                        <span
                          key={d.id}
                          className="rounded-[8px] border border-mist px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-moss"
                        >
                          {d.name.replace(/ Forest Division$/, "").replace(/ Division$/, "")}
                        </span>
                      ))}
                      {more > 0 && (
                        <span className="rounded-[8px] border border-mist px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-resin">
                          +{more} more
                        </span>
                      )}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-deodar">
                      Explore the circle
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>
    </main>
  );
}
