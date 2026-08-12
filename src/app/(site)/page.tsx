import dynamic from "next/dynamic";
import { Hero } from "@/components/site/hero";
import { MessagesSection } from "@/components/site/messages-section";
import { QuickServices } from "@/components/site/quick-services";
import { RegionsSection } from "@/components/site/regions-section";
import { SectionDivider } from "@/components/site/section-divider";
import { StatsBand } from "@/components/site/stats-band";

const FeaturedProjects = dynamic(
  () =>
    import("@/components/site/featured-projects").then((m) => m.FeaturedProjects),
  {
    loading: () => (
      <div className="bg-paper py-16 md:py-24" aria-hidden>
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="h-8 w-48 animate-pulse rounded bg-mist" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[12px] bg-mist" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const LatestNews = dynamic(
  () => import("@/components/site/latest-news").then((m) => m.LatestNews),
  {
    loading: () => (
      <div className="bg-white py-16 md:py-24" aria-hidden>
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="h-8 w-56 animate-pulse rounded bg-mist" />
          <div className="mt-10 h-64 animate-pulse rounded-[12px] bg-mist" />
        </div>
      </div>
    ),
  }
);

const LatestDownloadsSection = dynamic(
  () =>
    import("@/components/site/latest-downloads-section").then(
      (m) => m.LatestDownloadsSection
    ),
  {
    loading: () => (
      <div className="bg-paper py-16 md:py-24" aria-hidden>
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="h-8 w-56 animate-pulse rounded bg-mist" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-[12px] bg-mist" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const CtaBand = dynamic(
  () => import("@/components/site/cta-band").then((m) => m.CtaBand),
  {
    loading: () => <div className="bg-bark py-16 md:py-24" aria-hidden />,
  }
);

const LazySectionDivider = dynamic(
  () => import("@/components/site/section-divider").then((m) => m.SectionDivider)
);

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <StatsBand />
      <QuickServices />
      <MessagesSection />
      <SectionDivider />
      <RegionsSection />
      <LazySectionDivider />
      <FeaturedProjects />
      <LatestNews />
      <LatestDownloadsSection />
      <CtaBand />
    </main>
  );
}
