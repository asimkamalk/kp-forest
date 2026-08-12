import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestDetailForm } from "@/components/dashboard/requests/request-detail-form";

type Props = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const { id } = await params;
  const request = await prisma.publicRequest.findUnique({ where: { id } });
  if (!request) notFound();

  const handler = request.handledBy
    ? await prisma.user.findUnique({
        where: { id: request.handledBy },
        select: { name: true, email: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <div>
        <Link href="/dashboard/requests" className="text-sm text-bark/60 hover:text-bark">
          ← Requests
        </Link>
        <p className="eyebrow mt-4 text-resin">{request.ticketNo}</p>
        <h1 className="mt-1 font-display text-2xl text-bark">
          {request.topic ?? request.kind}
        </h1>
        <p className="mt-1 font-mono text-xs text-moss">
          {new Date(request.createdAt).toLocaleString()} · {request.kind}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <dl className="space-y-4 rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)]">
          <Item label="Full name" value={request.fullName} />
          <Item label="CNIC" value={request.cnic ?? "—"} mono />
          <Item label="Phone" value={request.phone} mono />
          <Item label="Email" value={request.email ?? "—"} />
          <Item label="District" value={request.district ?? "—"} />
          <Item label="Address" value={request.address ?? "—"} />
          <Item label="Purpose" value={request.purpose ?? "—"} />
          {request.attachmentUrl && (
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-moss">
                Attachment
              </dt>
              <dd className="mt-1">
                <a
                  href={request.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-deodar underline-offset-2 hover:underline"
                >
                  Open file
                </a>
              </dd>
            </div>
          )}
          <Item
            label="Handled by"
            value={handler ? `${handler.name} (${handler.email})` : "—"}
          />
        </dl>

        <RequestDetailForm
          id={request.id}
          requestStatus={request.requestStatus}
          officerNote={request.officerNote}
        />
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wider text-moss">{label}</dt>
      <dd
        className={
          mono
            ? "mt-1 font-mono text-sm text-bark"
            : "mt-1 whitespace-pre-wrap text-sm leading-relaxed text-bark"
        }
      >
        {value}
      </dd>
    </div>
  );
}
