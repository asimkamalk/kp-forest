import { DownloadKind } from "@prisma/client";
import { DownloadsList } from "@/components/site/downloads/downloads-list";
import { getDownloadsByKinds } from "@/lib/data/site";

export default async function ActsRulesPoliciesPage() {
  const items = await getDownloadsByKinds([
    DownloadKind.ACT,
    DownloadKind.RULE,
    DownloadKind.POLICY,
  ]);

  return (
    <DownloadsList
      items={items}
      emptyMessage="No acts, rules or policies have been issued yet."
      searchPlaceholder="Search acts, rules & policies…"
    />
  );
}
