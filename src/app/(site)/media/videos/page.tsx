import { VideosGrid } from "@/components/site/media/videos-grid";
import { getPublishedVideos } from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Videos",
  "Video features and field footage from the Forest Department of Khyber Pakhtunkhwa.",
  "/media/videos"
);

export default async function VideosPage() {
  const videos = await getPublishedVideos();
  return <VideosGrid videos={videos} />;
}
