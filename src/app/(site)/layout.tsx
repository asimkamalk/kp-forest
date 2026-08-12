import type { ReactNode } from "react";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getNavigation, getSiteSettings, type NavNode } from "@/lib/data/site";

function findEmergencyHref(items: NavNode[]): string | null {
  for (const item of items) {
    if (item.href && /emergency/i.test(item.label)) return item.href;
    for (const child of item.children) {
      if (child.href && /emergency/i.test(child.label)) return child.href;
    }
  }
  return null;
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);
  const emergencyHref = findEmergencyHref(nav);

  return (
    <LenisProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar
        items={nav}
        siteName={settings.siteName}
        siteNameUr={settings.siteNameUr}
        logoUrl={settings.logoUrl}
        emblemUrl={settings.emblemUrl}
        helpline={settings.helplineNumber}
        emergencyHref={emergencyHref}
      />
      <div id="main-content" tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
        {children}
      </div>
      <Footer settings={settings} nav={nav} />
    </LenisProvider>
  );
}
