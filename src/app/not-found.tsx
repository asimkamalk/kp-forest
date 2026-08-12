import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { StatusPageContent } from "@/components/site/status-page-content";
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

export default async function RootNotFound() {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);
  const emergencyHref = findEmergencyHref(nav);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper">
      <Navbar
        items={nav}
        siteName={settings.siteName}
        siteNameUr={settings.siteNameUr}
        logoUrl={settings.logoUrl}
        emblemUrl={settings.emblemUrl}
        helpline={settings.helplineNumber}
        emergencyHref={emergencyHref}
      />
      <main className="flex flex-1 flex-col">
        <StatusPageContent
          eyebrow="Not found"
          title="Page not found"
          body="That address is not on this site. Use the links below to get back to a working page."
        />
      </main>
      <Footer settings={settings} nav={nav} />
    </div>
  );
}
