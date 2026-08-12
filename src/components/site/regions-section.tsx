import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { ContourField } from "@/components/motion/contour-field";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { getRegions } from "@/lib/data/site";

function contourDensity(code: string): "sparse" | "medium" | "dense" {
  if (code === "I") return "sparse";
  if (code === "II") return "medium";
  return "dense";
}

export async function RegionsSection() {
  const regions = await getRegions();
  if (regions.length === 0) return null;

  return (
    <section aria-labelledby="regions-heading" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-2xl">
          <p className="eyebrow text-resin">Organisation</p>
          <h2
            id="regions-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] text-bark"
          >
            KP Forest Regions
          </h2>
          <p className="mt-3 text-base leading-relaxed text-moss">
            Three regions, eight circles and thirty-two divisions across Khyber Pakhtunkhwa.
          </p>
        </div>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-3" gap={0.1}>
          {regions.map((region) => {
            const divisionTotal = region.circles.reduce(
              (sum, c) => sum + c._count.divisions,
              0
            );
            const density = contourDensity(region.code);

            return (
              <StaggerItem key={region.id}>
                <Link
                  href={`/regions/${region.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[12px] border border-mist bg-paper shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-bark">
                    {region.coverImage ? (
                      <Image
                        src={region.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-deodar" />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-bark via-bark/50 to-transparent"
                      aria-hidden
                    />
                    <div className="pointer-events-none absolute inset-0 text-mist">
                      <ContourField density={density} opacity={0.14} parallax={0} />
                    </div>
                    <span
                      className="pointer-events-none absolute -right-1 -top-2 font-display text-[7rem] leading-none text-mist/30 select-none"
                      aria-hidden
                    >
                      {region.code}
                    </span>
                  </div>

                  <div className="relative flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl text-bark md:text-2xl">{region.name}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-moss">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {region.headquarters}
                    </p>
                    {region.shortDesc && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-bark/80">
                        {region.shortDesc}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-[8px] border border-mist bg-paper px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-moss">
                        {region._count.circles} circles
                      </span>
                      <span className="rounded-[8px] border border-mist bg-paper px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-moss">
                        {divisionTotal} divisions
                      </span>
                    </div>

                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-deodar">
                      Explore the region
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
