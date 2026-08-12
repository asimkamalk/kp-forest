import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PublishStatus } from "@prisma/client";

const PUBLISHED = { status: PublishStatus.PUBLISHED } as const;

/* ---------------------------------- NAV --------------------------------- */

export type NavNode = {
  id: string;
  label: string;
  href: string | null;
  isMegaMenu: boolean;
  children: { id: string; label: string; href: string | null; description?: string | null }[];
};

export const getNavigation = unstable_cache(
  async (): Promise<NavNode[]> => {
    const [items, regions] = await Promise.all([
      prisma.navItem.findMany({
        where: { parentId: null, isVisible: true },
        orderBy: { orderIndex: "asc" },
        include: {
          children: { where: { isVisible: true }, orderBy: { orderIndex: "asc" } },
        },
      }),
      prisma.region.findMany({
        where: PUBLISHED,
        orderBy: { orderIndex: "asc" },
        select: { id: true, name: true, slug: true, headquarters: true },
      }),
    ]);

    return items.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      isMegaMenu: item.isMegaMenu,
      children: item.isDynamicRegions
        ? regions.map((r) => ({
            id: r.id,
            label: r.name,
            href: `/regions/${r.slug}`,
            description: r.headquarters,
          }))
        : item.children.map((c) => ({ id: c.id, label: c.label, href: c.href })),
    }));
  },
  ["navigation"],
  { tags: ["nav"], revalidate: 3600 }
);

/* --------------------------------- HERO --------------------------------- */

export const getHeroSlides = unstable_cache(
  async () => {
    const now = new Date();
    return prisma.heroSlide.findMany({
      where: {
        ...PUBLISHED,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { orderIndex: "asc" },
    });
  },
  ["hero-slides"],
  { tags: ["hero"], revalidate: 300 }
);

/* ------------------------------- MESSAGES -------------------------------- */

export const getMessages = unstable_cache(
  async () =>
    prisma.message.findMany({
      where: PUBLISHED,
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        slug: true,
        kind: true,
        personName: true,
        designation: true,
        photoUrl: true,
        excerpt: true,
      },
    }),
  ["messages"],
  { tags: ["messages"], revalidate: 3600 }
);

export const getMessageBySlug = unstable_cache(
  async (slug: string) => prisma.message.findFirst({ where: { slug, ...PUBLISHED } }),
  ["message-by-slug"],
  { tags: ["messages"], revalidate: 3600 }
);

/* -------------------------------- STATS ---------------------------------- */

export const getStatCounters = unstable_cache(
  async () => prisma.statCounter.findMany({ where: PUBLISHED, orderBy: { orderIndex: "asc" } }),
  ["stat-counters"],
  { tags: ["stats"], revalidate: 3600 }
);

/* ------------------------- REGIONS → CIRCLES → DIVISIONS ------------------ */

export const getRegions = unstable_cache(
  async () =>
    prisma.region.findMany({
      where: PUBLISHED,
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        slug: true,
        code: true,
        name: true,
        headquarters: true,
        shortDesc: true,
        coverImage: true,
        centerLat: true,
        centerLng: true,
        _count: { select: { circles: true } },
        circles: {
          where: PUBLISHED,
          select: { _count: { select: { divisions: true } } },
        },
      },
    }),
  ["regions"],
  { tags: ["regions"], revalidate: 3600 }
);

/** Region page: its circles, each with a division count + preview names. */
export const getRegionWithCircles = unstable_cache(
  async (slug: string) =>
    prisma.region.findFirst({
      where: { slug, ...PUBLISHED },
      include: {
        circles: {
          where: PUBLISHED,
          orderBy: { orderIndex: "asc" },
          include: {
            _count: { select: { divisions: true } },
            divisions: {
              where: PUBLISHED,
              orderBy: { orderIndex: "asc" },
              select: { id: true, slug: true, name: true },
            },
          },
        },
      },
    }),
  ["region-with-circles"],
  { tags: ["regions"], revalidate: 3600 }
);

/** Circle page: its divisions. */
export const getCircleWithDivisions = unstable_cache(
  async (regionSlug: string, circleSlug: string) =>
    prisma.circle.findFirst({
      where: { slug: circleSlug, ...PUBLISHED, region: { slug: regionSlug, ...PUBLISHED } },
      include: {
        region: { select: { id: true, slug: true, name: true, code: true } },
        divisions: {
          where: PUBLISHED,
          orderBy: { orderIndex: "asc" },
          include: { _count: { select: { subDivisions: true, activities: true } } },
        },
      },
    }),
  ["circle-with-divisions"],
  { tags: ["regions"], revalidate: 3600 }
);

/* ------------------------------ SITE SETTINGS ---------------------------- */

export const getSiteSettings = unstable_cache(
  async () =>
    prisma.siteSetting.findUnique({ where: { id: "singleton" } }) ??
    prisma.siteSetting.create({ data: { id: "singleton" } }),
  ["site-settings"],
  { tags: ["settings"], revalidate: 3600 }
);
