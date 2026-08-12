import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/dashboard/data-table";
import { SortableList } from "@/components/dashboard/sortable-list";
import { reorderMessages } from "@/server/actions/message";
import {
  MessagesTableClient,
  type MessageRow,
} from "@/components/dashboard/messages/messages-table-client";

export default async function MessagesDashboardPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const messages = await prisma.message.findMany({
    orderBy: { orderIndex: "asc" },
  });

  const rows: MessageRow[] = messages.map((m) => ({
    id: m.id,
    slug: m.slug,
    personName: m.personName,
    designation: m.designation,
    photoUrl: m.photoUrl,
    status: m.status,
    orderIndex: m.orderIndex,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Content</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Messages</h1>
        </div>
        <Link
          href="/dashboard/messages/new"
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          New message
        </Link>
      </div>

      <MessagesTableClient rows={rows} />

      <section>
        <h2 className="mb-3 font-sans text-sm font-semibold text-bark">Reorder</h2>
        <SortableList
          items={messages.map((m) => ({
            id: m.id,
            label: m.personName,
            meta: <StatusBadge status={m.status} />,
          }))}
          onReorder={reorderMessages}
        />
      </section>
    </div>
  );
}
