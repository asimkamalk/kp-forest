"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { DirectoryContact } from "@/lib/data/site";
import { cn } from "@/lib/utils";

type DivisionGroup = {
  id: string;
  name: string;
  contacts: DirectoryContact[];
};

type CircleGroup = {
  id: string;
  name: string;
  divisions: DivisionGroup[];
};

type RegionGroup = {
  id: string;
  name: string;
  circles: CircleGroup[];
};

function buildTree(contacts: DirectoryContact[]): RegionGroup[] {
  const regions = new Map<string, RegionGroup>();

  for (const c of contacts) {
    let region = regions.get(c.regionId);
    if (!region) {
      region = { id: c.regionId, name: c.regionName, circles: [] };
      regions.set(c.regionId, region);
    }

    let circle = region.circles.find((x) => x.id === c.circleId);
    if (!circle) {
      circle = { id: c.circleId, name: c.circleName, divisions: [] };
      region.circles.push(circle);
    }

    let division = circle.divisions.find((x) => x.id === c.divisionId);
    if (!division) {
      division = { id: c.divisionId, name: c.divisionName, contacts: [] };
      circle.divisions.push(division);
    }

    division.contacts.push(c);
  }

  return Array.from(regions.values());
}

function ContactCard({ person }: { person: DirectoryContact }) {
  return (
    <li className="rounded-[12px] border border-mist bg-paper p-4 shadow-[var(--shadow-card)]">
      <p className="font-sans text-base font-medium text-bark">{person.name}</p>
      <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-moss">
        {person.designation}
      </p>
      <p className="mt-1 text-xs text-moss">{person.divisionName}</p>
      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        {person.phone && (
          <a
            href={`tel:${person.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 text-deodar hover:underline"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {person.phone}
          </a>
        )}
        {person.email && (
          <a
            href={`mailto:${person.email}`}
            className="inline-flex items-center gap-2 text-deodar hover:underline"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden />
            {person.email}
          </a>
        )}
      </div>
    </li>
  );
}

function Disclosure({
  title,
  count,
  defaultOpen = false,
  children,
  level,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
  level: "region" | "circle" | "division";
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "border-mist",
        level === "region" && "border-b pb-4",
        level === "circle" && "ml-0 border-l-2 border-mist pl-4",
        level === "division" && "ml-2"
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-2 text-left"
      >
        <span
          className={cn(
            "text-bark",
            level === "region" && "font-display text-xl md:text-2xl",
            level === "circle" && "font-sans text-base font-semibold",
            level === "division" && "font-sans text-sm font-medium"
          )}
        >
          {title}
          <span className="ml-2 font-mono text-xs font-normal text-moss">
            {count}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-moss transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && <div className="pb-3 pt-1">{children}</div>}
    </div>
  );
}

export function ContactDirectory({ contacts }: { contacts: DirectoryContact[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.designation.toLowerCase().includes(q) ||
        c.divisionName.toLowerCase().includes(q)
    );
  }, [contacts, deferred]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  if (contacts.length === 0) {
    return (
      <p className="mt-8 text-sm text-moss">
        No directory entries yet. Contacts appear here as they are published.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <label className="block max-w-md">
        <span className="sr-only">Search directory</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, designation or division…"
          className="h-11 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-moss">No contacts match “{deferred.trim()}”.</p>
      ) : (
        <div className="space-y-4">
          {tree.map((region, i) => {
            const regionCount = region.circles.reduce(
              (n, c) => n + c.divisions.reduce((m, d) => m + d.contacts.length, 0),
              0
            );
            return (
              <Reveal key={region.id} delay={i * 0.05}>
                <Disclosure
                  title={region.name}
                  count={regionCount}
                  defaultOpen={i === 0}
                  level="region"
                >
                  <div className="space-y-3">
                    {region.circles.map((circle) => {
                      const circleCount = circle.divisions.reduce(
                        (n, d) => n + d.contacts.length,
                        0
                      );
                      return (
                        <Disclosure
                          key={circle.id}
                          title={circle.name}
                          count={circleCount}
                          defaultOpen
                          level="circle"
                        >
                          <div className="space-y-3">
                            {circle.divisions.map((division) => (
                              <Disclosure
                                key={division.id}
                                title={division.name}
                                count={division.contacts.length}
                                defaultOpen
                                level="division"
                              >
                                <ul className="grid gap-3 sm:grid-cols-2">
                                  {division.contacts.map((person) => (
                                    <ContactCard key={person.id} person={person} />
                                  ))}
                                </ul>
                              </Disclosure>
                            ))}
                          </div>
                        </Disclosure>
                      );
                    })}
                  </div>
                </Disclosure>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
