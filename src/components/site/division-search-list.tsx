"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export type DivisionListItem = {
  id: string;
  slug: string;
  name: string;
  headquarters: string | null;
  officerName: string | null;
  subDivisionCount: number;
  href: string;
};

type Props = {
  divisions: DivisionListItem[];
};

export function DivisionSearchList({ divisions }: Props) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return divisions;
    return divisions.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.headquarters?.toLowerCase().includes(q) ?? false) ||
        (d.officerName?.toLowerCase().includes(q) ?? false)
    );
  }, [divisions, deferred]);

  return (
    <div>
      <label className="relative block max-w-md">
        <span className="sr-only">Search divisions</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-moss"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search divisions…"
          className="h-11 w-full rounded-[8px] border border-mist bg-paper py-2 pl-10 pr-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-moss">
          No divisions match “{query.trim()}”. Try another name or headquarters.
        </p>
      ) : (
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {filtered.map((division) => (
            <StaggerItem key={division.id}>
              <Link
                href={division.href}
                className="group flex h-full flex-col rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]"
              >
                <h3 className="font-display text-xl text-bark">{division.name}</h3>
                {division.headquarters && (
                  <p className="mt-2 text-sm text-moss">{division.headquarters}</p>
                )}
                {division.officerName && (
                  <p className="mt-3 text-sm text-bark/80">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-resin">
                      DFO
                    </span>{" "}
                    {division.officerName}
                  </p>
                )}
                <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-moss">
                  {division.subDivisionCount} sub-divisions
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-deodar">
                  View division
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
