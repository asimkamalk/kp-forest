import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  RequestsInboxClient,
  type RequestRow,
} from "@/components/dashboard/requests/requests-inbox-client";

export default async function RequestsDashboardPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const requests = await prisma.publicRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: RequestRow[] = requests.map((r) => ({
    id: r.id,
    ticketNo: r.ticketNo,
    kind: r.kind,
    subject: r.topic,
    fullName: r.fullName,
    district: r.district,
    requestStatus: r.requestStatus,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <p className="eyebrow text-resin">Inbox</p>
        <h1 className="mt-1 font-display text-2xl text-bark">Requests &amp; complaints</h1>
        <p className="mt-2 max-w-2xl text-sm text-moss">
          Citizen submissions containing personal data. Export only when needed — each
          export is recorded in the audit log.
        </p>
      </div>

      <RequestsInboxClient rows={rows} />
    </div>
  );
}
