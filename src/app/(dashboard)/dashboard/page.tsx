import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import {
  getDashboardStats,
  getRecentAuditLogs,
  getReviewQueue,
} from "@/lib/data/dashboard";
import { formatDisplayDateTime } from "@/lib/format-date";

function formatWhen(date: Date) {
  return formatDisplayDateTime(date) ?? "";
}

export default async function DashboardOverviewPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR,
    Role.VIEWER
  );

  const [stats, queue, audits] = await Promise.all([
    getDashboardStats(),
    getReviewQueue(12),
    getRecentAuditLogs(10),
  ]);

  const cards = [
    { label: "Regions", value: stats.regions },
    { label: "Circles", value: stats.circles },
    { label: "Divisions", value: stats.divisions },
    { label: "Published items", value: stats.published },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-2 font-display text-[clamp(1.75rem,3vw,2.25rem)] text-bark">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-moss">
          Counts, items awaiting review, and the latest audit activity.
        </p>
      </div>

      <section aria-label="Statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)]"
          >
            <p className="eyebrow text-moss">{card.label}</p>
            <p className="data mt-3 text-3xl text-bark">{card.value}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="review-heading"
          className="rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)]"
        >
          <h2 id="review-heading" className="font-sans text-lg font-semibold text-bark">
            Pending review
          </h2>
          <p className="mt-1 text-sm text-moss">Items with status REVIEW.</p>

          {queue.length === 0 ? (
            <p className="mt-6 text-sm text-moss">
              No items awaiting review. New submissions appear here when sent for review.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-mist">
              {queue.map((item) => (
                <li key={`${item.entity}-${item.id}`} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="block truncate text-sm font-medium text-bark transition-colors hover:text-deodar"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-moss">
                      {item.entity}
                    </p>
                  </div>
                  <time
                    dateTime={item.updatedAt.toISOString()}
                    className="data shrink-0 text-xs text-moss"
                  >
                    {formatWhen(item.updatedAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="audit-heading"
          className="rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)]"
        >
          <h2 id="audit-heading" className="font-sans text-lg font-semibold text-bark">
            Recent audit log
          </h2>
          <p className="mt-1 text-sm text-moss">Ten most recent entries.</p>

          {audits.length === 0 ? (
            <p className="mt-6 text-sm text-moss">
              No audit entries yet. Sign-ins and content changes appear here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-mist">
              {audits.map((row) => (
                <li key={row.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-bark">
                        <span className="font-mono text-xs uppercase tracking-wider text-resin">
                          {row.action}
                        </span>{" "}
                        <span className="text-moss">on</span> {row.entity}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-moss">
                        {row.userName ?? "System"}
                        {row.userEmail ? ` · ${row.userEmail}` : ""}
                      </p>
                    </div>
                    <time
                      dateTime={row.createdAt.toISOString()}
                      className="data shrink-0 text-xs text-moss"
                    >
                      {formatWhen(row.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
