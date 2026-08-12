import { NewsCoverageList } from "@/components/site/media/news-coverage-list";
import { getPublishedNewsCoverage } from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "News coverage",
  "Media coverage and news about the Forest Department and forests of Khyber Pakhtunkhwa.",
  "/media/news"
);

export default async function NewsPage() {
  const items = await getPublishedNewsCoverage();
  return <NewsCoverageList items={items} />;
}
