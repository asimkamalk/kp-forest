import { PhotoAlbumsGrid } from "@/components/site/media/photo-albums-grid";
import { getPublishedAlbums } from "@/lib/data/site";

export default async function PhotosIndexPage() {
  const albums = await getPublishedAlbums();
  return <PhotoAlbumsGrid albums={albums} />;
}
