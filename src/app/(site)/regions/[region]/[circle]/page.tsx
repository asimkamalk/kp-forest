import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import {
  DivisionSearchList,
  type DivisionListItem,
} from "@/components/site/division-search-list";
import { getCircleWithDivisions } from "@/lib/data/site";

type Props = {
  params: Promise<{ region: string; circle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, circle } = await params;
  const data = await getCircleWithDivisions(region, circle);
  if (!data) return { title: "Circle not found" };
  return {
    title: `${data.name} | ${data.region.name}`,
    description: data.shortDesc ?? data.description ?? undefined,
  };
}

export default async function CircleDetailPage({ params }: Props) {
  const { region: regionSlug, circle: circleSlug } = await params;
  const circle = await getCircleWithDivisions(regionSlug, circleSlug);
  if (!circle) notFound();

  const divisions: DivisionListItem[] = circle.divisions.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    headquarters: d.headquarters,
    officerName: d.officerName,
    subDivisionCount: d._count.subDivisions,
    href: `/regions/${circle.region.slug}/${circle.slug}/${d.slug}`,
  }));

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
                <li>
                  <Link
                    href={`/regions/${circle.region.slug}`}
                    className="transition-colors hover:text-resin"
                  >
                    {circle.region.name}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-mist">{circle.name}</li>
              </ol>
            </nav>

            <p className="eyebrow mt-8 text-resin">Forest circle</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-paper">
              {circle.name}
            </h1>
            {circle.headquarters && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-mist">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Headquarters: {circle.headquarters}
              </p>
            )}

            {(circle.officerName || circle.contactPhone || circle.contactEmail) && (
              <div className="mt-6 space-y-2 text-sm text-mist">
                {circle.officerName && (
                  <p>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-resin">
                      {circle.officerDesignation ?? "Conservator of Forests"}
                    </span>{" "}
                    {circle.officerName}
                  </p>
                )}
                {circle.contactPhone && (
                  <a
                    href={`tel:${circle.contactPhone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 transition-colors hover:text-resin"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {circle.contactPhone}
                  </a>
                )}
                {circle.contactEmail && (
                  <a
                    href={`mailto:${circle.contactEmail}`}
                    className="flex items-center gap-2 transition-colors hover:text-resin"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    {circle.contactEmail}
                  </a>
                )}
              </div>
            )}

            {(circle.description || circle.shortDesc) && (
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-mist">
                {circle.description ?? circle.shortDesc}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-paper px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="eyebrow text-resin">Divisions</p>
            <h2 className="mt-2 font-display text-2xl text-bark md:text-3xl">
              Forest divisions in this circle
            </h2>
          </Reveal>
          <div className="mt-8">
            <DivisionSearchList divisions={divisions} />
          </div>
        </div>
      </section>
    </main>
  );
}
