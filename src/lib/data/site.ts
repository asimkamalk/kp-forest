import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DownloadKind,
  MediaKind,
  MessageKind,
  ProjectStatus,
  PublishStatus,
} from "@prisma/client";

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
  ["hero-slides-v2"],
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

export async function getMessageBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.message.findFirst({
        where: { slug, ...PUBLISHED },
      }),
    ["message-by-slug", slug],
    { tags: ["messages"], revalidate: 3600 }
  )();
}

export const getPublishedMessageSlugs = unstable_cache(
  async () =>
    prisma.message.findMany({
      where: PUBLISHED,
      orderBy: { orderIndex: "asc" },
      select: { slug: true },
    }),
  ["message-slugs"],
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
        _count: {
          select: {
            circles: { where: PUBLISHED },
          },
        },
        circles: {
          where: PUBLISHED,
          select: {
            _count: {
              select: {
                divisions: { where: PUBLISHED },
              },
            },
          },
        },
      },
    }),
  ["regions"],
  { tags: ["regions"], revalidate: 3600 }
);

/** Region page: its circles, each with a division count + preview names. */
export async function getRegionWithCircles(slug: string) {
  return unstable_cache(
    async () =>
      prisma.region.findFirst({
        where: { slug, ...PUBLISHED },
        include: {
          circles: {
            where: PUBLISHED,
            orderBy: { orderIndex: "asc" },
            include: {
              _count: {
                select: {
                  divisions: { where: PUBLISHED },
                },
              },
              divisions: {
                where: PUBLISHED,
                orderBy: { orderIndex: "asc" },
                select: { id: true, slug: true, name: true },
              },
            },
          },
        },
      }),
    ["region-with-circles", slug],
    { tags: ["regions"], revalidate: 3600 }
  )();
}

/** Circle page: its divisions. Null unless the circle belongs to that region. */
export async function getCircleWithDivisions(regionSlug: string, circleSlug: string) {
  return unstable_cache(
    async () =>
      prisma.circle.findFirst({
        where: {
          slug: circleSlug,
          ...PUBLISHED,
          region: { slug: regionSlug, ...PUBLISHED },
        },
        include: {
          region: { select: { id: true, slug: true, name: true, code: true } },
          divisions: {
            where: PUBLISHED,
            orderBy: { orderIndex: "asc" },
            include: {
              _count: {
                select: {
                  subDivisions: { where: PUBLISHED },
                },
              },
            },
          },
        },
      }),
    ["circle-with-divisions", regionSlug, circleSlug],
    { tags: ["regions"], revalidate: 3600 }
  )();
}

/** Division detail: null unless the full region → circle → division chain matches. */
export async function getDivisionByPath(
  regionSlug: string,
  circleSlug: string,
  divisionSlug: string
) {
  return unstable_cache(
    async () =>
      prisma.division.findFirst({
        where: {
          slug: divisionSlug,
          ...PUBLISHED,
          circle: {
            slug: circleSlug,
            ...PUBLISHED,
            region: { slug: regionSlug, ...PUBLISHED },
          },
        },
        include: {
          circle: {
            select: {
              id: true,
              slug: true,
              name: true,
              region: { select: { id: true, slug: true, name: true, code: true } },
            },
          },
        },
      }),
    ["division-by-path", regionSlug, circleSlug, divisionSlug],
    { tags: ["regions"], revalidate: 3600 }
  )();
}

export const getPublishedRegionSlugs = unstable_cache(
  async () =>
    prisma.region.findMany({
      where: PUBLISHED,
      orderBy: { orderIndex: "asc" },
      select: { slug: true },
    }),
  ["region-slugs"],
  { tags: ["regions"], revalidate: 3600 }
);

/* ------------------------------- DOWNLOADS ------------------------------- */

export type PublicDownload = {
  id: string;
  title: string;
  titleUr: string | null;
  kind: DownloadKind;
  description: string | null;
  fileUrl: string;
  fileSize: number | null;
  documentDate: Date | null;
  downloadCount: number;
};

export async function getDownloadsByKinds(kinds: DownloadKind[]): Promise<PublicDownload[]> {
  const key = ["downloads-by-kinds", ...kinds].join("-");
  return unstable_cache(
    async () =>
      prisma.download.findMany({
        where: { ...PUBLISHED, kind: { in: kinds } },
        orderBy: [{ documentDate: "desc" }, { orderIndex: "asc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          titleUr: true,
          kind: true,
          description: true,
          fileUrl: true,
          fileSize: true,
          documentDate: true,
          downloadCount: true,
        },
      }),
    [key],
    { tags: ["downloads"], revalidate: 300 }
  )();
}

export const getDownloads = unstable_cache(
  async (): Promise<PublicDownload[]> =>
    prisma.download.findMany({
      where: PUBLISHED,
      orderBy: [{ documentDate: "desc" }, { orderIndex: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        titleUr: true,
        kind: true,
        description: true,
        fileUrl: true,
        fileSize: true,
        documentDate: true,
        downloadCount: true,
      },
    }),
  ["downloads-all"],
  { tags: ["downloads"], revalidate: 300 }
);

export const getLatestDownloads = unstable_cache(
  async (): Promise<PublicDownload[]> =>
    prisma.download.findMany({
      where: PUBLISHED,
      orderBy: [{ documentDate: "desc" }, { orderIndex: "asc" }, { title: "asc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        titleUr: true,
        kind: true,
        description: true,
        fileUrl: true,
        fileSize: true,
        documentDate: true,
        downloadCount: true,
      },
    }),
  ["latest-downloads"],
  { tags: ["downloads"], revalidate: 300 }
);

/* --------------------------- CONTACT DIRECTORY --------------------------- */

export type DirectoryContact = {
  id: string;
  name: string;
  designation: string;
  phone: string | null;
  email: string | null;
  regionName: string;
  regionId: string;
  circleName: string;
  circleId: string;
  divisionName: string;
  divisionId: string;
};

export const getContactDirectory = unstable_cache(
  async (): Promise<DirectoryContact[]> => {
    const rows = await prisma.contactPerson.findMany({
      where: PUBLISHED,
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        designation: true,
        phone: true,
        mobile: true,
        email: true,
        division: {
          select: {
            id: true,
            name: true,
            status: true,
            circle: {
              select: {
                id: true,
                name: true,
                status: true,
                region: {
                  select: { id: true, name: true, status: true },
                },
              },
            },
          },
        },
      },
    });

    return rows
      .filter(
        (r) =>
          r.division &&
          r.division.status === PublishStatus.PUBLISHED &&
          r.division.circle.status === PublishStatus.PUBLISHED &&
          r.division.circle.region.status === PublishStatus.PUBLISHED
      )
      .map((r) => ({
        id: r.id,
        name: r.name,
        designation: r.designation,
        phone: r.phone ?? r.mobile,
        email: r.email,
        regionName: r.division!.circle.region.name,
        regionId: r.division!.circle.region.id,
        circleName: r.division!.circle.name,
        circleId: r.division!.circle.id,
        divisionName: r.division!.name,
        divisionId: r.division!.id,
      }));
  },
  ["contact-directory"],
  { tags: ["contacts"], revalidate: 3600 }
);

/* ------------------------------ MEDIA CENTRE ----------------------------- */

export type LatestMediaItem = {
  id: string;
  slug: string;
  kind: MediaKind;
  title: string;
  summary: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
};

export const getLatestMedia = unstable_cache(
  async (): Promise<LatestMediaItem[]> =>
    prisma.mediaPost.findMany({
      where: {
        ...PUBLISHED,
        kind: { in: [MediaKind.PRESS_RELEASE, MediaKind.NEWS_COVERAGE] },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        slug: true,
        kind: true,
        title: true,
        summary: true,
        coverImage: true,
        publishedAt: true,
      },
    }),
  ["latest-media"],
  { tags: ["media"], revalidate: 300 }
);

const PRESS_PAGE_SIZE = 12;

export type PressReleaseListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: Date | null;
};

export async function getPressReleasesPage(page: number): Promise<{
  items: PressReleaseListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const safePage = Math.max(1, page);
  return unstable_cache(
    async () => {
      const where = { ...PUBLISHED, kind: MediaKind.PRESS_RELEASE };
      const [total, items] = await Promise.all([
        prisma.mediaPost.count({ where }),
        prisma.mediaPost.findMany({
          where,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          skip: (safePage - 1) * PRESS_PAGE_SIZE,
          take: PRESS_PAGE_SIZE,
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            publishedAt: true,
          },
        }),
      ]);
      return {
        items,
        total,
        page: safePage,
        pageSize: PRESS_PAGE_SIZE,
        totalPages: Math.max(1, Math.ceil(total / PRESS_PAGE_SIZE)),
      };
    },
    ["press-releases-page", String(safePage)],
    { tags: ["media"], revalidate: 300 }
  )();
}

export async function getPressReleaseBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.mediaPost.findFirst({
        where: { slug, kind: MediaKind.PRESS_RELEASE, ...PUBLISHED },
      }),
    ["press-release-by-slug", slug],
    { tags: ["media"], revalidate: 300 }
  )();
}

export const getPublishedPressReleaseSlugs = unstable_cache(
  async () =>
    prisma.mediaPost.findMany({
      where: { ...PUBLISHED, kind: MediaKind.PRESS_RELEASE },
      select: { slug: true },
    }),
  ["press-release-slugs"],
  { tags: ["media"], revalidate: 300 }
);

export type PublicAlbumCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  imageCount: number;
  divisionName: string | null;
  regionId: string | null;
  regionName: string | null;
};

export const getPublishedAlbums = unstable_cache(
  async (): Promise<PublicAlbumCard[]> =>
    prisma.galleryAlbum
      .findMany({
        where: PUBLISHED,
        orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
        include: {
          _count: { select: { images: true } },
          division: {
            select: {
              name: true,
              circle: {
                select: {
                  region: { select: { id: true, name: true } },
                },
              },
            },
          },
          circle: {
            select: { region: { select: { id: true, name: true } } },
          },
          region: { select: { id: true, name: true } },
        },
      })
      .then((rows) =>
        rows.map((a) => {
          const region =
            a.region ?? a.circle?.region ?? a.division?.circle.region ?? null;
          return {
            id: a.id,
            slug: a.slug,
            title: a.title,
            description: a.description,
            coverImage: a.coverImage,
            imageCount: a._count.images,
            divisionName: a.division?.name ?? null,
            regionId: region?.id ?? null,
            regionName: region?.name ?? null,
          };
        })
      ),
  ["gallery-albums"],
  { tags: ["media"], revalidate: 300 }
);

export async function getAlbumBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.galleryAlbum.findFirst({
        where: { slug, ...PUBLISHED },
        include: {
          division: {
            select: {
              name: true,
              circle: {
                select: {
                  name: true,
                  region: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
          images: {
            orderBy: { orderIndex: "asc" },
            include: {
              asset: {
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  fileName: true,
                },
              },
            },
          },
        },
      }),
    ["gallery-album-by-slug", slug],
    { tags: ["media"], revalidate: 300 }
  )();
}

export const getPublishedAlbumSlugs = unstable_cache(
  async () =>
    prisma.galleryAlbum.findMany({
      where: PUBLISHED,
      select: { slug: true },
    }),
  ["gallery-album-slugs"],
  { tags: ["media"], revalidate: 300 }
);

export type PublicVideoCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  videoUrl: string;
  publishedAt: Date | null;
};

export const getPublishedVideos = unstable_cache(
  async (): Promise<PublicVideoCard[]> =>
    prisma.mediaPost
      .findMany({
        where: {
          ...PUBLISHED,
          videoUrl: { not: null },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          coverImage: true,
          videoUrl: true,
          publishedAt: true,
        },
      })
      .then((rows) =>
        rows
          .filter((r): r is typeof r & { videoUrl: string } => Boolean(r.videoUrl))
          .map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            summary: r.summary,
            coverImage: r.coverImage,
            videoUrl: r.videoUrl,
            publishedAt: r.publishedAt,
          }))
      ),
  ["media-videos"],
  { tags: ["media"], revalidate: 300 }
);

export type PublicNewsCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  publishedAt: Date | null;
};

export const getPublishedNewsCoverage = unstable_cache(
  async (): Promise<PublicNewsCard[]> =>
    prisma.mediaPost.findMany({
      where: { ...PUBLISHED, kind: MediaKind.NEWS_COVERAGE },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        sourceName: true,
        sourceUrl: true,
        publishedAt: true,
      },
    }),
  ["media-news"],
  { tags: ["media"], revalidate: 300 }
);

/* -------------------------------- PROJECTS ------------------------------- */

export type FeaturedProject = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  progressPct: number;
  costPkr: number | null;
};

export const getFeaturedProjects = unstable_cache(
  async (): Promise<FeaturedProject[]> =>
    prisma.project.findMany({
      where: {
        ...PUBLISHED,
        projectStatus: ProjectStatus.ONGOING,
      },
      orderBy: { progressPct: "desc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverImage: true,
        progressPct: true,
        costPkr: true,
      },
    }),
  ["featured-projects"],
  { tags: ["projects"], revalidate: 300 }
);

export type PublicProjectCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  projectStatus: ProjectStatus;
  costPkr: number | null;
  startDate: Date | null;
  endDate: Date | null;
  progressPct: number;
  coverImage: string | null;
  regionId: string | null;
  regionName: string | null;
};

export async function getProjectsByStatus(
  projectStatus: ProjectStatus
): Promise<PublicProjectCard[]> {
  return unstable_cache(
    async () =>
      prisma.project.findMany({
        where: { ...PUBLISHED, projectStatus },
        orderBy: [{ progressPct: "desc" }, { title: "asc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          projectStatus: true,
          costPkr: true,
          startDate: true,
          endDate: true,
          progressPct: true,
          coverImage: true,
          regionId: true,
          region: { select: { id: true, name: true } },
          circle: { select: { region: { select: { id: true, name: true } } } },
          division: {
            select: {
              circle: { select: { region: { select: { id: true, name: true } } } },
            },
          },
        },
      }).then((rows) =>
        rows.map((r) => {
          const region =
            r.region ??
            r.circle?.region ??
            r.division?.circle.region ??
            null;
          return {
            id: r.id,
            slug: r.slug,
            title: r.title,
            summary: r.summary,
            projectStatus: r.projectStatus,
            costPkr: r.costPkr,
            startDate: r.startDate,
            endDate: r.endDate,
            progressPct: r.progressPct,
            coverImage: r.coverImage,
            regionId: region?.id ?? r.regionId,
            regionName: region?.name ?? null,
          };
        })
      ),
    ["projects-by-status", projectStatus],
    { tags: ["projects"], revalidate: 300 }
  )();
}

export async function getProjectBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.project.findFirst({
        where: { slug, ...PUBLISHED },
        include: {
          region: { select: { id: true, slug: true, name: true } },
          circle: {
            select: {
              id: true,
              slug: true,
              name: true,
              region: { select: { id: true, slug: true, name: true } },
            },
          },
          division: {
            select: {
              id: true,
              slug: true,
              name: true,
              circle: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  region: { select: { id: true, slug: true, name: true } },
                },
              },
            },
          },
        },
      }),
    ["project-by-slug", slug],
    { tags: ["projects"], revalidate: 300 }
  )();
}

export const getPublishedProjectSlugs = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: PUBLISHED,
      select: { slug: true },
    }),
  ["project-slugs"],
  { tags: ["projects"], revalidate: 300 }
);

/* ------------------------------ SITE SETTINGS ---------------------------- */

export const getSiteSettings = unstable_cache(
  async () => {
    const existing = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
    if (existing) return existing;
    return prisma.siteSetting.create({ data: { id: "singleton" } });
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 60 }
);

/* --------------------------------- PAGES -------------------------------- */

export type PublicPage = {
  id: string;
  slug: string;
  title: string;
  titleUr: string | null;
  summary: string | null;
  body: string;
  bodyUr: string | null;
  coverImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export async function getPageBySlug(slug: string): Promise<PublicPage | null> {
  return unstable_cache(
    async () =>
      prisma.page.findFirst({
        where: { slug, ...PUBLISHED },
        select: {
          id: true,
          slug: true,
          title: true,
          titleUr: true,
          summary: true,
          body: true,
          bodyUr: true,
          coverImage: true,
          seoTitle: true,
          seoDescription: true,
        },
      }),
    ["page", slug],
    { tags: ["pages", `page:${slug}`], revalidate: 3600 }
  )();
}

/* ----------------------------- ORGANOGRAM -------------------------------- */

export type OrganogramOfficer = {
  officeTitle: string;
  name: string | null;
  designation: string | null;
  href: string | null;
};

export type OrganogramDivision = {
  id: string;
  name: string;
  slug: string;
  officerName: string | null;
  officerDesignation: string | null;
  href: string;
};

export type OrganogramCircle = {
  id: string;
  name: string;
  slug: string;
  officerName: string | null;
  officerDesignation: string | null;
  href: string;
  divisions: OrganogramDivision[];
};

export type OrganogramRegion = {
  id: string;
  name: string;
  slug: string;
  code: string;
  officerName: string | null;
  officerDesignation: string | null;
  href: string;
  circles: OrganogramCircle[];
};

export type OrganogramTree = {
  secretary: OrganogramOfficer;
  chiefConservator: OrganogramOfficer;
  regions: OrganogramRegion[];
};

export const getOrganogram = unstable_cache(
  async (): Promise<OrganogramTree> => {
    const [messages, regions] = await Promise.all([
      prisma.message.findMany({
        where: {
          ...PUBLISHED,
          kind: {
            in: [
              MessageKind.SECRETARY_CLIMATE_CHANGE,
              MessageKind.SECRETARY,
              MessageKind.CHIEF_CONSERVATOR,
            ],
          },
        },
        orderBy: { orderIndex: "asc" },
        select: {
          slug: true,
          kind: true,
          personName: true,
          designation: true,
        },
      }),
      prisma.region.findMany({
        where: PUBLISHED,
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
          officerName: true,
          officerDesignation: true,
          circles: {
            where: PUBLISHED,
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
              officerName: true,
              officerDesignation: true,
              divisions: {
                where: PUBLISHED,
                orderBy: { orderIndex: "asc" },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  officerName: true,
                  officerDesignation: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const secretaryMsg =
      messages.find((m) => m.kind === MessageKind.SECRETARY_CLIMATE_CHANGE) ??
      messages.find((m) => m.kind === MessageKind.SECRETARY) ??
      null;
    const ccfMsg =
      messages.find((m) => m.kind === MessageKind.CHIEF_CONSERVATOR) ?? null;

    return {
      secretary: {
        officeTitle: "Secretary",
        name: secretaryMsg?.personName ?? null,
        designation: secretaryMsg?.designation ?? null,
        href: secretaryMsg ? `/messages/${secretaryMsg.slug}` : null,
      },
      chiefConservator: {
        officeTitle: "Chief Conservator of Forests",
        name: ccfMsg?.personName ?? null,
        designation: ccfMsg?.designation ?? null,
        href: ccfMsg ? `/messages/${ccfMsg.slug}` : null,
      },
      regions: regions.map((region) => ({
        id: region.id,
        name: region.name,
        slug: region.slug,
        code: region.code,
        officerName: region.officerName,
        officerDesignation: region.officerDesignation,
        href: `/regions/${region.slug}`,
        circles: region.circles.map((circle) => ({
          id: circle.id,
          name: circle.name,
          slug: circle.slug,
          officerName: circle.officerName,
          officerDesignation: circle.officerDesignation,
          href: `/regions/${region.slug}/${circle.slug}`,
          divisions: circle.divisions.map((division) => ({
            id: division.id,
            name: division.name,
            slug: division.slug,
            officerName: division.officerName,
            officerDesignation: division.officerDesignation,
            href: `/regions/${region.slug}/${circle.slug}/${division.slug}`,
          })),
        })),
      })),
    };
  },
  ["organogram"],
  { tags: ["regions", "messages"], revalidate: 3600 }
);

/* -------------------------- EMERGENCY CONTACTS --------------------------- */

export type EmergencyContact = {
  id: string;
  name: string;
  designation: string;
  phone: string | null;
  divisionName: string | null;
  regionName: string;
  regionId: string;
};

export type EmergencyRegionGroup = {
  regionId: string;
  regionName: string;
  contacts: EmergencyContact[];
};

export const getEmergencyContacts = unstable_cache(
  async (): Promise<EmergencyRegionGroup[]> => {
    const rows = await prisma.contactPerson.findMany({
      where: { ...PUBLISHED, isEmergency: true },
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        designation: true,
        phone: true,
        mobile: true,
        division: {
          select: {
            name: true,
            status: true,
            circle: {
              select: {
                status: true,
                region: {
                  select: { id: true, name: true, status: true, orderIndex: true },
                },
              },
            },
          },
        },
      },
    });

    const groups = new Map<string, EmergencyRegionGroup>();

    for (const r of rows) {
      const region = r.division?.circle.region;
      if (
        !r.division ||
        r.division.status !== PublishStatus.PUBLISHED ||
        r.division.circle.status !== PublishStatus.PUBLISHED ||
        !region ||
        region.status !== PublishStatus.PUBLISHED
      ) {
        continue;
      }

      const phone = r.phone ?? r.mobile;
      let group = groups.get(region.id);
      if (!group) {
        group = {
          regionId: region.id,
          regionName: region.name,
          contacts: [],
        };
        groups.set(region.id, group);
      }

      group.contacts.push({
        id: r.id,
        name: r.name,
        designation: r.designation,
        phone,
        divisionName: r.division.name,
        regionName: region.name,
        regionId: region.id,
      });
    }

    return Array.from(groups.values()).sort((a, b) =>
      a.regionName.localeCompare(b.regionName)
    );
  },
  ["emergency-contacts"],
  { tags: ["contacts"], revalidate: 300 }
);

/* --------------------------- KNOW YOUR FOREST ---------------------------- */

export type KnowYourForestCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
};

export const getKnowYourForestArticles = unstable_cache(
  async (): Promise<KnowYourForestCard[]> =>
    prisma.knowYourForestArticle.findMany({
      where: PUBLISHED,
      orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverImage: true,
      },
    }),
  ["know-your-forest"],
  { tags: ["know-your-forest"], revalidate: 3600 }
);

export async function getKnowYourForestBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.knowYourForestArticle.findFirst({
        where: { slug, ...PUBLISHED },
        select: {
          id: true,
          slug: true,
          title: true,
          titleUr: true,
          summary: true,
          body: true,
          coverImage: true,
        },
      }),
    ["know-your-forest", slug],
    { tags: ["know-your-forest", `kyf:${slug}`], revalidate: 3600 }
  )();
}

export const getPublishedKnowYourForestSlugs = unstable_cache(
  async () =>
    prisma.knowYourForestArticle.findMany({
      where: PUBLISHED,
      select: { slug: true },
    }),
  ["know-your-forest-slugs"],
  { tags: ["know-your-forest"], revalidate: 3600 }
);

/* ------------------------------- WILDLIFE -------------------------------- */

export type WildlifeSpeciesCard = {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string | null;
  category: string | null;
  conservationStatus: string | null;
  habitat: string | null;
  imageUrl: string | null;
};

export const getWildlifeSpecies = unstable_cache(
  async (): Promise<WildlifeSpeciesCard[]> =>
    prisma.wildlifeSpecies.findMany({
      where: PUBLISHED,
      orderBy: [{ commonName: "asc" }],
      select: {
        id: true,
        slug: true,
        commonName: true,
        scientificName: true,
        category: true,
        conservationStatus: true,
        habitat: true,
        imageUrl: true,
      },
    }),
  ["wildlife-species"],
  { tags: ["wildlife"], revalidate: 3600 }
);
