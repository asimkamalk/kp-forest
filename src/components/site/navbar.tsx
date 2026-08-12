"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import type { NavNode } from "@/lib/data/site";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  items: NavNode[];
  siteName: string;
  siteNameUr?: string | null;
  logoUrl?: string | null;
  emblemUrl?: string | null;
  helpline?: string | null;
  /** From the database nav tree — shown only when present. */
  emergencyHref?: string | null;
};

export function Navbar({
  items,
  siteName,
  siteNameUr,
  logoUrl,
  emblemUrl,
  helpline,
  emergencyHref,
}: Props) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const brandSrc = emblemUrl || logoUrl;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const isActive = (href: string | null) =>
    href ? (href === "/" ? pathname === "/" : pathname.startsWith(href)) : false;

  const itemActive = (item: NavNode) =>
    isActive(item.href) || item.children.some((c) => isActive(c.href));

  return (
    <>
      {/* Government strip */}
      <div className="hidden bg-bark text-[11px] text-mist md:block">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-2 font-mono tracking-wide">
          <span>Government of Khyber Pakhtunkhwa</span>
          <div className="flex items-center gap-5">
            {helpline && (
              <a
                href={`tel:${helpline.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-mist transition-colors hover:text-resin"
              >
                <Phone className="h-3 w-3" aria-hidden />
                Helpline {helpline}
              </a>
            )}
            {emergencyHref && (
              <Link href={emergencyHref} className="text-mist transition-colors hover:text-resin">
                Emergency Contacts
              </Link>
            )}
            <button
              type="button"
              className="rounded-[8px] border border-moss/40 px-2 py-0.5 text-mist transition-colors hover:border-resin hover:text-resin"
              lang="ur"
            >
              اردو
            </button>
          </div>
        </div>
      </div>

      <motion.header
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled
            ? "bg-paper/90 shadow-[var(--shadow-card)] backdrop-blur-md"
            : "bg-paper"
        }`}
        onMouseLeave={() => setOpenId(null)}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto max-w-[1200px] px-6"
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 shrink items-center gap-3 py-3">
              {brandSrc ? (
                <Image
                  src={brandSrc}
                  alt={siteName}
                  width={48}
                  height={48}
                  className="h-11 w-11 shrink-0 object-contain"
                  style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
                />
              ) : (
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-deodar font-mono text-sm font-medium text-paper"
                  aria-hidden
                >
                  KP
                </div>
              )}
              <div className="min-w-0 leading-tight">
                <div className="font-sans text-[15px] font-semibold text-bark">
                  {siteName}
                </div>
                {siteNameUr && (
                  <div className="text-xs text-moss" lang="ur">
                    {siteNameUr}
                  </div>
                )}
              </div>
            </Link>

            <button
              type="button"
              className="rounded-[8px] p-2 text-bark lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <ul className="hidden items-center justify-between gap-1 border-t border-mist lg:flex">
            {items.map((item, index) => {
              const hasChildren = item.children.length > 0;
              const open = openId === item.id;
              const active = itemActive(item);
              /* Wide / late menus would overflow the viewport if left-aligned. */
              const alignEnd =
                item.isMegaMenu || index >= Math.max(0, items.length - 3);

              return (
                <li
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (hasChildren) setOpenId(item.id);
                    else setOpenId(null);
                  }}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-haspopup="true"
                      onClick={() => setOpenId(open ? null : item.id)}
                      className={`relative flex items-center gap-1 whitespace-nowrap px-2 py-3.5 text-sm font-medium transition-colors xl:px-3 ${
                        active || open ? "text-deodar" : "text-bark/80 hover:text-deodar"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-2 bottom-2.5 h-0.5 rounded bg-resin xl:inset-x-3"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      className={`relative block whitespace-nowrap px-2 py-3.5 text-sm font-medium transition-colors xl:px-3 ${
                        active ? "text-deodar" : "text-bark/80 hover:text-deodar"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-2 bottom-2.5 h-0.5 rounded bg-resin xl:inset-x-3"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  ) : null}

                  <AnimatePresence>
                    {hasChildren && open && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: EASE }}
                        className={`absolute top-full z-50 rounded-[12px] border border-mist bg-paper p-2 shadow-[var(--shadow-card)] ${
                          alignEnd ? "right-0 left-auto" : "left-0"
                        } ${
                          item.isMegaMenu
                            ? "grid w-[min(520px,calc(100vw-2rem))] grid-cols-2 gap-1"
                            : "w-64"
                        }`}
                      >
                        {item.children.map((child) =>
                          child.href ? (
                            <Link
                              key={child.id}
                              href={child.href}
                              className="group flex flex-col rounded-[8px] px-3 py-2.5 transition-colors hover:bg-mist/60"
                            >
                              <span className="text-sm font-medium text-bark group-hover:text-deodar">
                                {child.label}
                              </span>
                              {child.description && (
                                <span className="text-xs text-moss">{child.description}</span>
                              )}
                            </Link>
                          ) : null
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-bark/40 lg:hidden"
              aria-hidden
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: 24 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed inset-y-0 right-0 z-[70] w-[85%] max-w-sm overflow-y-auto bg-paper p-5 shadow-[var(--shadow-card-hover)] lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="eyebrow">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-[8px] p-1 text-bark"
                >
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
  const reduce = useReducedMotion();
  const baseId = useId();

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const panelId = `${baseId}-${item.id}`;
        const open = expanded === item.id;

        return (
          <li key={item.id} className="border-b border-mist last:border-0">
            {item.children.length === 0 && item.href ? (
              <Link href={item.href} className="block py-3 text-[15px] font-medium text-bark">
                {item.label}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  id={`${panelId}-trigger`}
                  onClick={() => setExpanded(open ? null : item.id)}
                  className="flex w-full items-center justify-between py-3 text-left text-[15px] font-medium text-bark"
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-haspopup="true"
                >
                  {item.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.ul
                      id={panelId}
                      role="region"
                      aria-labelledby={`${panelId}-trigger`}
                      initial={reduce ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="pb-2 pl-3"
                    >
                      {item.href && (
                        <li>
                          <Link href={item.href} className="block py-2 text-sm text-deodar">
                            {item.label}
                          </Link>
                        </li>
                      )}
                      {item.children.map((c) =>
                        c.href ? (
                          <li key={c.id}>
                            <Link href={c.href} className="block py-2 text-sm text-moss hover:text-deodar">
                              {c.label}
                            </Link>
                          </li>
                        ) : null
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
