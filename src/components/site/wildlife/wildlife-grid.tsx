import Link from "next/link";
import Image from "next/image";
import type { WildlifeSpeciesCard } from "@/lib/data/site";
import { WILDLIFE_CATEGORIES } from "@/lib/validators/services";
import { cn } from "@/lib/utils";

function iucnBadgeClass(status: string | null): string {
  const code = (status ?? "").trim().toUpperCase().split(/[\s(/]/)[0] ?? "";
  switch (code) {
    case "EX":
    case "EW":
    case "CR":
      return "border-resin/50 bg-resin/20 text-bark";
    case "EN":
      return "border-bark/30 bg-bark text-paper";
    case "VU":
      return "border-deodar/40 bg-deodar/15 text-deodar";
    case "NT":
      return "border-moss/50 bg-moss/20 text-bark";
    case "LC":
      return "border-mist bg-mist text-deodar";
    default:
      return "border-mist bg-paper text-moss";
  }
}

type Props = {
  species: WildlifeSpeciesCard[];
  activeCategory: string | null;
};

export function WildlifeGrid({ species, activeCategory }: Props) {
  const filtered = activeCategory
    ? species.filter(
        (s) => (s.category ?? "").toLowerCase() === activeCategory.toLowerCase()
      )
    : species;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <FilterChip href="/wildlife" active={!activeCategory}>
          All
        </FilterChip>
        {WILDLIFE_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            href={`/wildlife?category=${encodeURIComponent(cat)}`}
            active={activeCategory?.toLowerCase() === cat.toLowerCase()}
          >
            {cat}
          </FilterChip>
        ))}
      </div>

      {species.length === 0 ? (
        <p className="text-sm text-moss">
          No species published yet. Profiles appear here as they are added.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-moss">No species in this category.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-[12px] border border-mist bg-white shadow-[var(--shadow-card)]"
            >
              <div
                className="relative aspect-[4/3] bg-mist"
                style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.commonName}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-display text-xl text-bark">{item.commonName}</h2>
                  {item.conservationStatus && (
                    <span
                      className={cn(
                        "inline-flex rounded-[8px] border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
                        iucnBadgeClass(item.conservationStatus)
                      )}
                    >
                      {item.conservationStatus}
                    </span>
                  )}
                </div>
                {item.scientificName && (
                  <p className="font-sans text-sm italic text-moss">{item.scientificName}</p>
                )}
                {item.habitat && (
                  <p className="text-sm leading-relaxed text-bark/80">{item.habitat}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-[8px] border px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
        active
          ? "border-deodar bg-deodar text-paper"
          : "border-mist bg-paper text-moss hover:border-deodar hover:text-bark"
      )}
    >
      {children}
    </Link>
  );
}
