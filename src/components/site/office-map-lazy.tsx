"use client";

import dynamic from "next/dynamic";

export const OfficeMap = dynamic(
  () => import("@/components/site/office-map").then((m) => m.OfficeMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[280px] rounded-[12px] bg-mist" aria-hidden />
    ),
  }
);
