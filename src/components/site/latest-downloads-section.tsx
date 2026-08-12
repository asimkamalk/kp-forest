import { LatestDownloads } from "@/components/site/latest-downloads";
import { getLatestDownloads } from "@/lib/data/site";

export async function LatestDownloadsSection() {
  const items = await getLatestDownloads();
  return <LatestDownloads items={items} />;
}
