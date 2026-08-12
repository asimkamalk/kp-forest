"use client";

import { Toaster as Sonner } from "sonner";

export function DashboardToaster() {
  return (
    <Sonner
      theme="light"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "border border-mist bg-paper text-bark shadow-[var(--shadow-card)]",
          title: "text-bark",
          description: "text-moss",
          success: "border-deodar/30",
          error: "border-resin/40",
        },
      }}
    />
  );
}
