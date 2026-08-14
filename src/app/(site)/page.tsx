import { Hero } from "@/components/site/hero";
import { QuickServices } from "@/components/site/quick-services";
import { SectionDivider } from "@/components/site/section-divider";
import { StatsBand } from "@/components/site/stats-band";
import { MessagesSection } from "@/components/site/messages-section";
import { RegionsSection } from "@/components/site/regions-section";
import { FeaturedProjects } from "@/components/site/featured-projects";
import { LatestNews } from "@/components/site/latest-news";
import { LatestDownloadsSection } from "@/components/site/latest-downloads-section";
import { CtaBand } from "@/components/site/cta-band";
import { GovernmentOrgJsonLd } from "@/components/site/government-org-json-ld";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Forest Department, Khyber Pakhtunkhwa | Official portal",
  "Official portal of the Forest Department, Government of Khyber Pakhtunkhwa — regions, projects, downloads, media and citizen services.",
  "/"
);

export default function Home() {
  return (
    <>
      <GovernmentOrgJsonLd />
      <main className="flex-1">
        <Hero />
        <StatsBand />
        <QuickServices />
        <MessagesSection />
        <SectionDivider />
        <RegionsSection />
        <SectionDivider />
        <FeaturedProjects />
        <LatestNews />
        <LatestDownloadsSection />
        <CtaBand />
      </main>
    </>
  );
}
