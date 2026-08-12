import { VideosGrid } from "@/components/site/media/videos-grid";
import { getPublishedVideos } from "@/lib/data/site";

export default async function VideosPage() {
  const videos = await getPublishedVideos();
  return <VideosGrid videos={videos} />;
}
