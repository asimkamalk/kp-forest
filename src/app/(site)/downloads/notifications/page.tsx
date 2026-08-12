import { DownloadKind } from "@prisma/client";
import { DownloadsList } from "@/components/site/downloads/downloads-list";
import { getDownloadsByKinds } from "@/lib/data/site";

export default async function NotificationsPage() {
  const items = await getDownloadsByKinds([DownloadKind.NOTIFICATION]);

  return (
    <DownloadsList
      items={items}
      emptyMessage="No notifications have been issued yet."
      searchPlaceholder="Search notifications…"
    />
  );
}
