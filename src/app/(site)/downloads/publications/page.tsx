import { DownloadKind } from "@prisma/client";
import { DownloadsList } from "@/components/site/downloads/downloads-list";
import { getDownloadsByKinds } from "@/lib/data/site";

export default async function PublicationsPage() {
  const items = await getDownloadsByKinds([DownloadKind.REPORT, DownloadKind.FORM]);

  return (
    <DownloadsList
      items={items}
      emptyMessage="No publications have been issued yet."
      searchPlaceholder="Search publications…"
    />
  );
}
