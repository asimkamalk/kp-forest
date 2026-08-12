"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/media/press-releases", label: "Press releases" },
  { href: "/media/photos", label: "Photos" },
  { href: "/media/videos", label: "Videos" },
  { href: "/media/news", label: "News" },
] as const;

export function MediaTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Media gallery" className="border-b border-mist">
      <ul className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center px-3 text-sm font-medium transition-colors",
                  active ? "text-bark" : "text-moss hover:text-bark"
                )}
              >
                {tab.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-0.5 bg-resin"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
