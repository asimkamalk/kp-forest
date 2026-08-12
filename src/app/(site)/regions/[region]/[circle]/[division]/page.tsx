import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { getDivisionByPath } from "@/lib/data/site";

type Props = {
  params: Promise<{ region: string; circle: string; division: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, circle, division } = await params;
  const data = await getDivisionByPath(region, circle, division);
  if (!data) return { title: "Division not found" };
  return {
    title: `${data.name} | ${data.circle.region.name}`,
    description: data.shortDesc ?? data.description ?? undefined,
  };
}

export default async function DivisionDetailPage({ params }: Props) {
  const { region, circle, division: divisionSlug } = await params;
  const division = await getDivisionByPath(region, circle, divisionSlug);
  if (!division) notFound();

  const { circle: parentCircle } = division;
  const parentRegion = parentCircle.region;

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
                    href={`/regions/${parentRegion.slug}`}
                    className="transition-colors hover:text-resin"
                  >
                    {parentRegion.name}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={`/regions/${parentRegion.slug}/${parentCircle.slug}`}
                    className="transition-colors hover:text-resin"
                  >
                    {parentCircle.name}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-mist">{division.name}</li>
              </ol>
            </nav>

            <p className="eyebrow mt-8 text-resin">Forest division</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-paper">
              {division.name}
            </h1>
            {division.headquarters && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-mist">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Headquarters: {division.headquarters}
              </p>
            )}

            {(division.officerName || division.contactPhone || division.contactEmail) && (
              <div className="mt-6 space-y-2 text-sm text-mist">
                {division.officerName && (
                  <p>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-resin">
                      {division.officerDesignation ?? "Divisional Forest Officer"}
                    </span>{" "}
                    {division.officerName}
                  </p>
                )}
                {division.contactPhone && (
                  <a
                    href={`tel:${division.contactPhone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 transition-colors hover:text-resin"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {division.contactPhone}
                  </a>
                )}
                {division.contactEmail && (
                  <a
                    href={`mailto:${division.contactEmail}`}
                    className="flex items-center gap-2 transition-colors hover:text-resin"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    {division.contactEmail}
                  </a>
                )}
              </div>
            )}

            {(division.description || division.shortDesc) && (
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-mist">
                {division.description ?? division.shortDesc}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-paper px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="eyebrow text-resin">Coming next</p>
            <h2 className="mt-2 font-display text-2xl text-bark">Gallery and activities</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-moss">
              Photo galleries and field activities for this division will appear here as they are
              published from the dashboard.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
