"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Printer } from "lucide-react";
import type {
  OrganogramDivision,
  OrganogramOfficer,
  OrganogramTree,
} from "@/lib/data/site";
import { cn } from "@/lib/utils";

type Props = {
  tree: OrganogramTree;
};

export function OrganogramTree({ tree }: Props) {
  const [openRegions, setOpenRegions] = useState<Record<string, boolean>>({});
  const [openCircles, setOpenCircles] = useState<Record<string, boolean>>({});

  const toggleRegion = (id: string) =>
    setOpenRegions((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleCircle = (id: string) =>
    setOpenCircles((prev) => ({ ...prev, [id]: !prev[id] }));

  const expandAll = () => {
    const regions: Record<string, boolean> = {};
    const circles: Record<string, boolean> = {};
    for (const r of tree.regions) {
      regions[r.id] = true;
      for (const c of r.circles) circles[c.id] = true;
    }
    setOpenRegions(regions);
    setOpenCircles(circles);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper hover:bg-bark"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print organogram
        </button>
        <button
          type="button"
          onClick={expandAll}
          className="inline-flex h-10 items-center rounded-[8px] border border-mist px-4 text-sm font-medium text-bark hover:bg-mist/40"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() => {
            setOpenRegions({});
            setOpenCircles({});
          }}
          className="inline-flex h-10 items-center rounded-[8px] border border-mist px-4 text-sm font-medium text-bark hover:bg-mist/40"
        >
          Collapse to regions
        </button>
      </div>

      <div className="relative">
        <div
          className="organogram-scroll overflow-x-auto pb-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="min-w-[720px] space-y-3 print:min-w-0">
            <OfficerCard officer={tree.secretary} level="root" />
            <Branch>
              <OfficerCard officer={tree.chiefConservator} level="root" />
              <Branch>
                {tree.regions.map((region) => {
                  const open = openRegions[region.id] ?? false;
                  return (
                    <div key={region.id} className="space-y-2">
                      <TreeNode
                        open={open}
                        onToggle={() => toggleRegion(region.id)}
                        title={region.name}
                        meta={`Region ${region.code}`}
                        officerName={region.officerName}
                        officerDesignation={region.officerDesignation}
                        href={region.href}
                        defaultOpenOnPrint
                      />
                      <div
                        className={cn(
                          "pl-4 sm:pl-6",
                          open ? "block" : "hidden print:block"
                        )}
                      >
                        <Branch>
                          {region.circles.map((circle) => {
                            const circleOpen = openCircles[circle.id] ?? false;
                            return (
                              <div key={circle.id} className="space-y-2">
                                <TreeNode
                                  open={circleOpen}
                                  onToggle={() => toggleCircle(circle.id)}
                                  title={circle.name}
                                  meta="Circle"
                                  officerName={circle.officerName}
                                  officerDesignation={circle.officerDesignation}
                                  href={circle.href}
                                  defaultOpenOnPrint
                                />
                                <div
                                  className={cn(
                                    "pl-4 sm:pl-6",
                                    circleOpen ? "block" : "hidden print:block"
                                  )}
                                >
                                  <Branch>
                                    {circle.divisions.map((division) => (
                                      <DivisionLeaf
                                        key={division.id}
                                        division={division}
                                      />
                                    ))}
                                  </Branch>
                                </div>
                              </div>
                            );
                          })}
                        </Branch>
                      </div>
                    </div>
                  );
                })}
              </Branch>
            </Branch>
          </div>
        </div>
        <p
          className="mt-2 font-mono text-[10px] uppercase tracking-wider text-moss md:hidden print:hidden"
          aria-hidden
        >
          Swipe sideways to see the full tree →
        </p>
      </div>
    </div>
  );
}

function Branch({ children }: { children: ReactNode }) {
  return <div className="space-y-2 border-l border-mist pl-3 sm:pl-4">{children}</div>;
}

function OfficerCard({
  officer,
  level,
}: {
  officer: OrganogramOfficer;
  level: "root";
}) {
  const content = (
    <>
      <p className="eyebrow text-resin">{officer.officeTitle}</p>
      <p className="mt-1 font-sans text-base font-semibold text-bark">
        {officer.name ?? "Officer to be named"}
      </p>
      {officer.designation && (
        <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-moss">
          {officer.designation}
        </p>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "rounded-[12px] border border-mist bg-white p-4 shadow-[var(--shadow-card)]",
        level === "root" && "max-w-md"
      )}
    >
      {officer.href ? (
        <Link href={officer.href} className="block transition-colors hover:text-deodar">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

function TreeNode({
  open,
  onToggle,
  title,
  meta,
  officerName,
  officerDesignation,
  href,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  meta: string;
  officerName: string | null;
  officerDesignation: string | null;
  href: string;
  defaultOpenOnPrint?: boolean;
}) {
  return (
    <div className="rounded-[12px] border border-mist bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="inline-flex items-center border-r border-mist px-3 text-moss hover:bg-mist/30 hover:text-bark print:hidden"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "rotate-0" : "-rotate-90"
            )}
            aria-hidden
          />
          <span className="sr-only">{open ? "Collapse" : "Expand"} {title}</span>
        </button>
        <Link
          href={href}
          className="min-w-0 flex-1 px-4 py-3 transition-colors hover:bg-mist/20"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            {meta}
          </p>
          <p className="mt-0.5 font-sans text-sm font-semibold text-bark">{title}</p>
          {(officerName || officerDesignation) && (
            <p className="mt-1 text-xs text-moss">
              {officerName ?? "—"}
              {officerDesignation ? ` · ${officerDesignation}` : ""}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
}

function DivisionLeaf({ division }: { division: OrganogramDivision }) {
  return (
    <Link
      href={division.href}
      className="block rounded-[8px] border border-mist bg-paper px-4 py-2.5 transition-colors hover:border-deodar"
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
        Division
      </p>
      <p className="mt-0.5 text-sm font-medium text-bark">{division.name}</p>
      {(division.officerName || division.officerDesignation) && (
        <p className="mt-1 text-xs text-moss">
          {division.officerName ?? "—"}
          {division.officerDesignation ? ` · ${division.officerDesignation}` : ""}
        </p>
      )}
    </Link>
  );
}
