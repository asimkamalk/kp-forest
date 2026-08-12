import { PhotoAlbumsGrid } from "@/components/site/media/photo-albums-grid";
import { getPublishedAlbums } from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Photo galleries",
  "Photo albums from Forest Department programmes, landscapes and field work across KP.",
  "/media/photos"
);

export default async function PhotosIndexPage() {
  const albums = await getPublishedAlbums();
  return <PhotoAlbumsGrid albums={albums} />;
}
