import { Hero } from "@/components/site/hero";
import { MessagesSection } from "@/components/site/messages-section";
import { RegionsSection } from "@/components/site/regions-section";
import { StatsBand } from "@/components/site/stats-band";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <StatsBand />
      <MessagesSection />
      <RegionsSection />
    </main>
  );
}
