"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import type { NavNode } from "@/lib/data/site";

type Props = {
  items: NavNode[];
  siteName: string;
  siteNameUr?: string | null;
  logoUrl?: string | null;
  helpline?: string | null;
};

export function Navbar({ items, siteName, siteNameUr, logoUrl, helpline }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on navigation
  useEffect(() => {
    setOpenId(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenId(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string | null) =>
    href ? (href === "/" ? pathname === "/" : pathname.startsWith(href)) : false;

  return (
    <>
      {/* Government top strip */}
      <div className="hidden bg-green-950 text-[13px] text-green-100 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <span>Government of Khyber Pakhtunkhwa</span>
          <div className="flex items-center gap-5">
            {helpline && (
              <a href={`tel:${helpline}`} className="flex items-center gap-1.5 hover:text-white">
                <Phone className="h-3.5 w-3.5" />
                Helpline {helpline}
              </a>
            )}
            <Link href="/services/emergency-contacts" className="hover:text-white">
              Emergency Contacts
            </Link>
            <button className="rounded border border-green-700 px-2 py-0.5 hover:bg-green-900">
              اردو
            </button>
          </div>
        </div>
      </div>

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/90 shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md"
            : "bg-white"
        }`}
        onMouseLeave={() => setOpenId(null)}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6"
        >
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-3 py-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="" width={48} height={48} className="h-11 w-11 object-contain" />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-full bg-green-800 text-lg font-bold text-white">
                KP
              </div>
            )}
            <div className="leading-tight">
              <div className="text-[15px] font-semibold text-green-900">{siteName}</div>
              {siteNameUr && <div className="text-xs text-neutral-500">{siteNameUr}</div>}
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center lg:flex">
            {items.map((item) => {
              const hasChildren = item.children.length > 0;
              const open = openId === item.id;

              return (
                <li key={item.id} className="relative" onMouseEnter={() => setOpenId(item.id)}>
                  {item.href && !hasChildren ? (
                    <Link
                      href={item.href}
                      className={`relative block px-3.5 py-6 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-green-800"
                          : "text-neutral-700 hover:text-green-800"
                      }`}
                    >
                      {item.label}
                      {isActive(item.href) && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-3 bottom-4 h-0.5 rounded bg-green-700"
                        />
                      )}
                    </Link>
                  ) : (
                    <button
                      aria-expanded={open}
                      aria-haspopup="true"
                      onClick={() => setOpenId(open ? null : item.id)}
                      className={`flex items-center gap-1 px-3.5 py-6 text-sm font-medium transition-colors ${
                        open ? "text-green-800" : "text-neutral-700 hover:text-green-800"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

                  <AnimatePresence>
                    {hasChildren && open && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className={`absolute left-0 top-full rounded-xl border border-neutral-200 bg-white p-2 shadow-xl ${
                          item.isMegaMenu ? "grid w-[520px] grid-cols-2 gap-1" : "w-64"
                        }`}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href ?? "#"}
                            className="group flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-green-50"
                          >
                            <span className="text-sm font-medium text-neutral-800 group-hover:text-green-800">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="text-xs text-neutral-500">{child.description}</span>
                            )}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <button
            className="rounded-lg p-2 text-neutral-700 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[70] w-[85%] max-w-sm overflow-y-auto bg-white p-5 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-green-900">Menu</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <MobileNav items={items} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNav({ items }: { items: NavNode[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id} className="border-b border-neutral-100 last:border-0">
          {item.children.length === 0 && item.href ? (
            <Link href={item.href} className="block py-3 text-[15px] font-medium text-neutral-800">
              {item.label}
            </Link>
          ) : (
            <>
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="flex w-full items-center justify-between py-3 text-left text-[15px] font-medium text-neutral-800"
                aria-expanded={expanded === item.id}
              >
                {item.label}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${expanded === item.id ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {expanded === item.id && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pb-2 pl-3"
                  >
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <Link href={c.href ?? "#"} className="block py-2 text-sm text-neutral-600">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
