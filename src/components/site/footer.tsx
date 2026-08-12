import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import type { NavNode } from "@/lib/data/site";
import { getRegions } from "@/lib/data/site";

type Settings = {
  siteName: string;
  siteNameUr?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  emblemUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  helplineNumber?: string | null;
  footerNote?: string | null;
};

type Props = {
  settings: Settings;
  nav: NavNode[];
};

function quickLinksFromNav(nav: NavNode[]) {
  const links: { id: string; label: string; href: string }[] = [];
  for (const item of nav) {
    if (item.href) {
      links.push({ id: item.id, label: item.label, href: item.href });
    }
    for (const child of item.children) {
      if (child.href) {
        links.push({ id: child.id, label: child.label, href: child.href });
      }
    }
  }
  // Keep the footer column readable — first unique hrefs from the DB menu.
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  }).slice(0, 8);
}

export async function Footer({ settings, nav }: Props) {
  const regions = await getRegions();
  const quickLinks = quickLinksFromNav(nav);
  const brandSrc = settings.emblemUrl || settings.logoUrl;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-bark text-mist">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* About */}
        <div>
          <div className="flex items-start gap-3">
            {brandSrc ? (
              <Image
                src={brandSrc}
                alt={settings.siteName}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
              />
            ) : (
              <div
                className="grid h-12 w-12 place-items-center rounded-[8px] bg-deodar font-mono text-sm font-medium text-paper"
                aria-hidden
              >
                KP
              </div>
            )}
            <div>
              <p className="font-sans text-sm font-semibold text-paper">{settings.siteName}</p>
              {settings.siteNameUr && (
                <p className="mt-1 text-xs text-moss" lang="ur">
                  {settings.siteNameUr}
                </p>
              )}
            </div>
          </div>
          {settings.tagline && (
            <p className="mt-4 text-sm leading-relaxed text-moss">{settings.tagline}</p>
          )}
        </div>

        {/* Quick Links — from NavItem rows */}
        <div>
          <p className="eyebrow mb-4 text-resin">Quick Links</p>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="text-sm text-mist transition-colors hover:text-resin"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Regions — from Region table */}
        <div>
          <p className="eyebrow mb-4 text-resin">Regions</p>
          <ul className="space-y-2">
            {regions.map((region) => (
              <li key={region.id}>
                <Link
                  href={`/regions/${region.slug}`}
                  className="text-sm text-mist transition-colors hover:text-resin"
                >
                  <span className="data mr-2 text-moss">Region {region.code}</span>
                  {region.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="eyebrow mb-4 text-resin">Contact</p>
          <ul className="space-y-3 text-sm">
            {settings.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.phone && (
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 transition-colors hover:text-resin"
                >
                  <Phone className="h-4 w-4 shrink-0 text-moss" aria-hidden />
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.helplineNumber && (
              <li>
                <a
                  href={`tel:${settings.helplineNumber.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 transition-colors hover:text-resin"
                >
                  <Phone className="h-4 w-4 shrink-0 text-resin" aria-hidden />
                  Helpline {settings.helplineNumber}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 transition-colors hover:text-resin"
                >
                  <Mail className="h-4 w-4 shrink-0 text-moss" aria-hidden />
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-deodar/60">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-4 text-xs text-moss sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">
            © {year} {settings.siteName}
          </p>
          {settings.footerNote && <p>{settings.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
