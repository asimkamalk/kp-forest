import { PressReleasesList } from "@/components/site/media/press-releases-list";
import { getPressReleasesPage } from "@/lib/data/site";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PressReleasesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const result = await getPressReleasesPage(page);

  return (
    <PressReleasesList
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
    />
  );
}
