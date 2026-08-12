import { PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ReviewQueueItem = {
  id: string;
  entity: string;
  title: string;
  updatedAt: Date;
  href: string;
};

export type RecentAuditItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
};

export async function getDashboardStats() {
  const [regions, circles, divisions, published] = await Promise.all([
    prisma.region.count(),
    prisma.circle.count(),
    prisma.division.count(),
    Promise.all([
      prisma.heroSlide.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.message.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.region.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.circle.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.division.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.project.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.download.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.mediaPost.count({ where: { status: PublishStatus.PUBLISHED } }),
    ]).then((counts) => counts.reduce((a, b) => a + b, 0)),
  ]);

  return { regions, circles, divisions, published };
}

export async function getReviewQueue(limit = 12): Promise<ReviewQueueItem[]> {
  const review = { status: PublishStatus.REVIEW } as const;

  const [heroes, messages, regions, projects, downloads, media] = await Promise.all([
    prisma.heroSlide.findMany({
      where: review,
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.message.findMany({
      where: review,
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, personName: true, updatedAt: true },
    }),
    prisma.region.findMany({
      where: review,
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, name: true, updatedAt: true },
    }),
    prisma.project.findMany({
      where: review,
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.download.findMany({
      where: review,
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.mediaPost.findMany({
      where: review,
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, updatedAt: true },
    }),
  ]);

  const items: ReviewQueueItem[] = [
    ...heroes.map((h) => ({
      id: h.id,
      entity: "HeroSlide",
      title: h.title,
      updatedAt: h.updatedAt,
      href: `/dashboard/hero`,
    })),
    ...messages.map((m) => ({
      id: m.id,
      entity: "Message",
      title: m.personName,
      updatedAt: m.updatedAt,
      href: `/dashboard/messages`,
    })),
    ...regions.map((r) => ({
      id: r.id,
      entity: "Region",
      title: r.name,
      updatedAt: r.updatedAt,
      href: `/dashboard/regions`,
    })),
    ...projects.map((p) => ({
      id: p.id,
      entity: "Project",
      title: p.title,
      updatedAt: p.updatedAt,
      href: `/dashboard/projects`,
    })),
    ...downloads.map((d) => ({
      id: d.id,
      entity: "Download",
      title: d.title,
      updatedAt: d.updatedAt,
      href: `/dashboard/downloads`,
    })),
    ...media.map((m) => ({
      id: m.id,
      entity: "MediaPost",
      title: m.title,
      updatedAt: m.updatedAt,
      href: `/dashboard/media`,
    })),
  ];

  return items
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

export async function getRecentAuditLogs(limit = 10): Promise<RecentAuditItem[]> {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    createdAt: row.createdAt,
    userName: row.user?.name ?? null,
    userEmail: row.user?.email ?? null,
  }));
}
