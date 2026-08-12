import { NewsCoverageList } from "@/components/site/media/news-coverage-list";
import { getPublishedNewsCoverage } from "@/lib/data/site";

export default async function NewsPage() {
  const items = await getPublishedNewsCoverage();
  return <NewsCoverageList items={items} />;
}
