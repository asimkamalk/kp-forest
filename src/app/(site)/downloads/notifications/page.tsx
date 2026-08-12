import { DownloadKind } from "@prisma/client";
import { DownloadsList } from "@/components/site/downloads/downloads-list";
import { getDownloadsByKinds } from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Notifications",
  "Official notifications issued by the Forest Department, Government of Khyber Pakhtunkhwa.",
  "/downloads/notifications"
);

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
