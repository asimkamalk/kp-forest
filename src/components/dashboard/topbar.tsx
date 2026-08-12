"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Search, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  userName: string;
  userEmail: string;
  userRole: string;
  signOutAction: () => Promise<void>;
};

function breadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: part
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

export function DashboardTopbar({ userName, userEmail, userRole, signOutAction }: Props) {
  const pathname = usePathname();
  const crumbs = breadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-mist bg-paper/95 px-4 backdrop-blur-md md:px-6">
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-moss">
          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              {i === crumbs.length - 1 ? (
                <span className="font-medium text-bark">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="transition-colors hover:text-deodar">
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="relative hidden max-w-xs flex-1 md:block">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-moss"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search dashboard…"
          className="h-9 w-full rounded-[8px] border border-mist bg-paper py-1.5 pl-9 pr-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30"
          aria-label="Search dashboard"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 rounded-[8px] border border-mist bg-paper px-2.5 py-1.5 text-sm text-bark outline-none transition-colors hover:border-deodar focus-visible:ring-2 focus-visible:ring-resin/40"
          aria-haspopup="menu"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-deodar text-paper">
            <User className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="hidden max-w-[10rem] truncate text-left sm:block">
            <span className="block truncate font-medium">{userName}</span>
            <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-moss">
              {userRole.replaceAll("_", " ")}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-moss" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-56 border-mist bg-paper text-bark shadow-[var(--shadow-card)]"
        >
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium text-bark">{userName}</p>
            <p className="text-xs text-moss">{userEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-mist" />
          <DropdownMenuItem
            className="cursor-pointer text-bark focus:bg-mist focus:text-bark"
            onSelect={(e) => {
              e.preventDefault();
              void signOutAction();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
