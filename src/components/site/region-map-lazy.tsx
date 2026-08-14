"use client";

import dynamic from "next/dynamic";

export const RegionMap = dynamic(
  () => import("@/components/site/region-map").then((m) => m.RegionMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[280px] rounded-[12px] bg-mist" aria-hidden />
    ),
  }
);
