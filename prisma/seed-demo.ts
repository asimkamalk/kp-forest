import "dotenv/config";
import {
  DownloadKind,
  MediaKind,
  PrismaClient,
  ProjectStatus,
  PublishStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Demo / placeholder content only.
 * Safe to re-run. Does not replace structural data from prisma/seed.ts.
 *
 * Every record is provisional — department editors should replace all of it.
 */

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Counts = Record<string, { created: number; updated: number; skipped: number }>;

function bump(counts: Counts, key: string, kind: "created" | "updated" | "skipped") {
  if (!counts[key]) counts[key] = { created: 0, updated: 0, skipped: 0 };
  counts[key][kind] += 1;
}

const DEMO_MARKER = "[Demo placeholder]";

const IMAGE_PATHS = [
  "/images/forest-1.jpg",
  "/images/plantation.jpg",
  "/images/wildlife.jpg",
] as const;

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function monthsAgo(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setMonth(d.getMonth() - n);
  return d;
}

async function requireDivisions() {
  const divisions = await prisma.division.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: { name: "asc" },
    include: {
      circle: { include: { region: true } },
    },
  });
  if (divisions.length < 6) {
    throw new Error(
      `Need at least 6 published divisions (found ${divisions.length}). Run npm run db:seed first.`
    );
  }
  return divisions;
}

async function requireRegions() {
  const regions = await prisma.region.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: { orderIndex: "asc" },
  });
  if (regions.length < 3) {
    throw new Error(
      `Need at least 3 published regions (found ${regions.length}). Run npm run db:seed first.`
    );
  }
  return regions;
}

/* -------------------------------- PROJECTS ------------------------------- */

async function seedProjects(counts: Counts) {
  const regions = await requireRegions();
  const divisions = await requireDivisions();

  const projects: {
    slug: string;
    title: string;
    projectStatus: ProjectStatus;
    progressPct: number;
    costPkr: number;
    summary: string;
    description: string;
    regionId?: string;
    divisionId?: string;
  }[] = [
    {
      slug: "demo-watershed-rehabilitation",
      title: "Watershed rehabilitation — demo sample",
      projectStatus: ProjectStatus.COMPLETED,
      progressPct: 100,
      costPkr: 25_000_000,
      summary:
        "Placeholder summary for a completed watershed rehabilitation sample. Replace with the real programme description before publishing to citizens.",
      description:
        "Demo body text only. Outline scope, sites and outcomes here once verified figures are available.",
      regionId: regions[0]!.id,
    },
    {
      slug: "demo-nursery-development",
      title: "Nursery development — demo sample",
      projectStatus: ProjectStatus.COMPLETED,
      progressPct: 100,
      costPkr: 12_000_000,
      summary:
        "Placeholder summary for a completed nursery development sample. Editors should swap this for an approved abstract.",
      description:
        "Demo body text only. List species, capacity and locations after internal review.",
      divisionId: divisions[0]!.id,
      regionId: divisions[0]!.circle.regionId,
    },
    {
      slug: "demo-forest-road-maintenance",
      title: "Forest road maintenance — demo sample",
      projectStatus: ProjectStatus.ONGOING,
      progressPct: 25,
      costPkr: 8_000_000,
      summary:
        "Placeholder summary for an ongoing forest road maintenance sample (progress set to 25% for layout testing).",
      description:
        "Demo body text only. Record stretches, seasons and contractor notes when real data is ready.",
      divisionId: divisions[1]!.id,
      regionId: divisions[1]!.circle.regionId,
    },
    {
      slug: "demo-fire-management",
      title: "Fire management — demo sample",
      projectStatus: ProjectStatus.ONGOING,
      progressPct: 60,
      costPkr: 15_000_000,
      summary:
        "Placeholder summary for an ongoing fire management sample (progress set to 60% for layout testing).",
      description:
        "Demo body text only. Add watchtowers, crews and equipment lists from the approved plan.",
      regionId: regions[1]!.id,
    },
    {
      slug: "demo-community-forestry",
      title: "Community forestry — demo sample",
      projectStatus: ProjectStatus.ONGOING,
      progressPct: 85,
      costPkr: 30_000_000,
      summary:
        "Placeholder summary for an ongoing community forestry sample (progress set to 85% for layout testing).",
      description:
        "Demo body text only. Replace with partnership agreements and village lists after clearance.",
      divisionId: divisions[2]!.id,
      regionId: divisions[2]!.circle.regionId,
    },
    {
      slug: "demo-biodiversity-survey",
      title: "Biodiversity survey — demo sample",
      projectStatus: ProjectStatus.FUTURE,
      progressPct: 0,
      costPkr: 5_000_000,
      summary:
        "Placeholder summary for a future biodiversity survey sample. Not a scheduled departmental commitment.",
      description:
        "Demo body text only. Insert methodology and study area once the proposal is approved.",
      regionId: regions[2]!.id,
    },
  ];

  for (const p of projects) {
    const existing = await prisma.project.findUnique({ where: { slug: p.slug } });
    const data = {
      title: p.title,
      projectStatus: p.projectStatus,
      progressPct: p.progressPct,
      costPkr: p.costPkr,
      summary: p.summary,
      description: p.description,
      coverImage: IMAGE_PATHS[0],
      status: PublishStatus.PUBLISHED,
      regionId: p.regionId ?? null,
      divisionId: p.divisionId ?? null,
      circleId: null as string | null,
    };

    if (existing) {
      await prisma.project.update({ where: { slug: p.slug }, data });
      bump(counts, "projects", "updated");
    } else {
      await prisma.project.create({ data: { slug: p.slug, ...data } });
      bump(counts, "projects", "created");
    }
  }
}

/* --------------------------------- MEDIA --------------------------------- */

async function seedMedia(counts: Counts) {
  const posts: {
    slug: string;
    kind: MediaKind;
    title: string;
    summary: string;
    body: string;
    publishedAt: Date;
    mythText?: string;
    factText?: string;
    coverImage?: string;
    sourceName?: string;
  }[] = [
    {
      slug: "demo-press-nursery-season-open",
      kind: MediaKind.PRESS_RELEASE,
      title: "Demo press release: nursery season notice",
      summary:
        "This is placeholder copy for a press release about seasonal nursery activity. Replace both sentences with cleared departmental wording before public use.",
      body: "Demo press release body. Editors should paste the approved text here.",
      publishedAt: daysAgo(10),
      coverImage: IMAGE_PATHS[1],
    },
    {
      slug: "demo-press-committee-meeting",
      kind: MediaKind.PRESS_RELEASE,
      title: "Demo press release: coordination meeting held",
      summary:
        "Placeholder summary describing a routine coordination meeting sample. Do not treat names, dates or outcomes in this block as factual.",
      body: "Demo press release body for layout and workflow testing only.",
      publishedAt: daysAgo(28),
      coverImage: IMAGE_PATHS[0],
    },
    {
      slug: "demo-press-plantation-drive-reminder",
      kind: MediaKind.PRESS_RELEASE,
      title: "Demo press release: plantation drive reminder",
      summary:
        "Placeholder reminder text for a plantation campaign sample. Swap for the real advisory once communications approve it.",
      body: "Demo body. List venues and timings only after confirmation.",
      publishedAt: daysAgo(45),
      coverImage: IMAGE_PATHS[1],
    },
    {
      slug: "demo-press-training-workshop",
      kind: MediaKind.PRESS_RELEASE,
      title: "Demo press release: field staff workshop",
      summary:
        "Placeholder note about a training workshop sample for field staff. This is not an announcement of an actual scheduled event.",
      body: "Demo workshop write-up for the media centre cards.",
      publishedAt: daysAgo(70),
      coverImage: IMAGE_PATHS[2],
    },
    {
      slug: "demo-news-coverage-valley-greening",
      kind: MediaKind.NEWS_COVERAGE,
      title: "Demo news coverage: valley greening feature",
      summary:
        "Placeholder paraphrase of external news coverage for layout. Link a real source URL when the clipping is archived.",
      body: "Demo news coverage body. Attribute the outlet in sourceName after verification.",
      publishedAt: daysAgo(18),
      coverImage: IMAGE_PATHS[0],
      sourceName: "Demo outlet name",
    },
    {
      slug: "demo-news-coverage-wildlife-corridor",
      kind: MediaKind.NEWS_COVERAGE,
      title: "Demo news coverage: wildlife corridor mention",
      summary:
        "Placeholder summary of a wildlife corridor news sample. Replace with an accurate citation before going live.",
      body: "Demo news coverage body for the homepage media strip.",
      publishedAt: daysAgo(55),
      coverImage: IMAGE_PATHS[2],
      sourceName: "Demo outlet name",
    },
    {
      slug: "demo-interview-conservator-overview",
      kind: MediaKind.INTERVIEW,
      title: "Demo interview: role overview (placeholder)",
      summary:
        "Placeholder interview summary with a fictional framing for UI testing. Do not attribute quotes to any real officer.",
      body: "Demo interview transcript stub. Insert cleared Q&A when available.",
      publishedAt: daysAgo(35),
      coverImage: IMAGE_PATHS[1],
    },
    {
      slug: "demo-myth-vs-fact-forest-fire",
      kind: MediaKind.MYTH_VS_FACT,
      title: "Demo myth vs fact: forest fire causes",
      summary:
        "Placeholder myth-versus-fact card for the media centre. Both myth and fact lines below are provisional teaching copy only.",
      body: "Demo explainer. Expand with references after review.",
      publishedAt: daysAgo(5),
      coverImage: IMAGE_PATHS[0],
      mythText:
        "Demo myth line: “Forest fires only start from lightning.” Replace this sentence with a myth the department wants to address.",
      factText:
        "Demo fact line: “Most ignitions in managed areas are human-related; report smoke early to the local division.” Replace with the cleared fact.",
    },
  ];

  for (const post of posts) {
    const existing = await prisma.mediaPost.findUnique({ where: { slug: post.slug } });
    const data = {
      kind: post.kind,
      title: post.title,
      summary: post.summary,
      body: post.body,
      publishedAt: post.publishedAt,
      coverImage: post.coverImage ?? null,
      mythText: post.mythText ?? null,
      factText: post.factText ?? null,
      sourceName: post.sourceName ?? null,
      status: PublishStatus.PUBLISHED,
    };

    if (existing) {
      await prisma.mediaPost.update({ where: { slug: post.slug }, data });
      bump(counts, "mediaPosts", "updated");
    } else {
      await prisma.mediaPost.create({ data: { slug: post.slug, ...data } });
      bump(counts, "mediaPosts", "created");
    }
  }
}

/* ------------------------------- DOWNLOADS ------------------------------- */

async function seedDownloads(counts: Counts) {
  const downloads: {
    title: string;
    kind: DownloadKind;
    description: string;
    fileSize: number;
    documentDate: Date;
    orderIndex: number;
  }[] = [
    {
      title: "Annual progress report — demo sample (FY placeholder)",
      kind: DownloadKind.REPORT,
      description: "Placeholder PDF slot for an annual progress report. Replace file and metadata.",
      fileSize: 2_450_000,
      documentDate: monthsAgo(14),
      orderIndex: 0,
    },
    {
      title: "Nursery production report — demo sample",
      kind: DownloadKind.REPORT,
      description: "Placeholder PDF slot for a nursery production report sample.",
      fileSize: 1_120_000,
      documentDate: monthsAgo(4),
      orderIndex: 1,
    },
    {
      title: "Plantation season notification — demo sample",
      kind: DownloadKind.NOTIFICATION,
      description: "Placeholder notification document for plantation season guidance.",
      fileSize: 320_000,
      documentDate: monthsAgo(2),
      orderIndex: 2,
    },
    {
      title: "Fire season advisory notification — demo sample",
      kind: DownloadKind.NOTIFICATION,
      description: "Placeholder advisory notification for fire season readiness.",
      fileSize: 280_000,
      documentDate: monthsAgo(8),
      orderIndex: 3,
    },
    {
      title: "Forest ordinance (consolidated extract) — demo sample",
      kind: DownloadKind.ACT,
      description: "Placeholder extract labelled as an ordinance sample for downloads UI.",
      fileSize: 890_000,
      documentDate: monthsAgo(20),
      orderIndex: 4,
    },
    {
      title: "Forest (amendment) act extract — demo sample",
      kind: DownloadKind.ACT,
      description: "Placeholder act extract for acts/rules/policies tab testing.",
      fileSize: 760_000,
      documentDate: monthsAgo(6),
      orderIndex: 5,
    },
  ];

  for (const d of downloads) {
    const existing = await prisma.download.findFirst({
      where: { title: d.title },
    });
    const data = {
      title: d.title,
      kind: d.kind,
      description: d.description,
      fileUrl: "/downloads/placeholder.pdf",
      fileSize: d.fileSize,
      documentDate: d.documentDate,
      orderIndex: d.orderIndex,
      status: PublishStatus.PUBLISHED,
    };

    if (existing) {
      await prisma.download.update({ where: { id: existing.id }, data });
      bump(counts, "downloads", "updated");
    } else {
      await prisma.download.create({ data });
      bump(counts, "downloads", "created");
    }
  }
}

/* ------------------------------- CONTACTS -------------------------------- */

async function seedContacts(counts: Counts) {
  const divisions = await requireDivisions();
  const picked = divisions.slice(0, 12);

  // Remove previous demo contacts so re-runs stay clean.
  await prisma.contactPerson.deleteMany({
    where: { department: DEMO_MARKER },
  });

  const designations = [
    "Divisional Forest Officer (demo)",
    "Range Officer (demo)",
    "Deputy Ranger (demo)",
    "Office Superintendent (demo)",
  ];

  for (let i = 0; i < picked.length; i++) {
    const div = picked[i]!;
    const n = String(i + 1).padStart(2, "0");
    await prisma.contactPerson.create({
      data: {
        name: `Demo Officer ${n}`,
        designation: designations[i % designations.length]!,
        department: DEMO_MARKER,
        phone: `091-00000${n}`,
        mobile: `0300-00000${n}`,
        email: `demo.officer.${n}@example.invalid`,
        isEmergency: i < 3,
        orderIndex: i,
        status: PublishStatus.PUBLISHED,
        divisionId: div.id,
      },
    });
    bump(counts, "contactPersons", "created");
  }
}

/* --------------------------------- STATS --------------------------------- */

async function seedStats(counts: Counts) {
  const existing = await prisma.statCounter.count();
  if (existing > 0) {
    counts.statCounters = { created: 0, updated: 0, skipped: existing };
    return;
  }

  await prisma.statCounter.createMany({
    data: [
      { label: "Forest Regions", value: 3, orderIndex: 0, icon: "Map" },
      { label: "Forest Circles", value: 8, orderIndex: 1, icon: "Layers" },
      { label: "Forest Divisions", value: 32, orderIndex: 2, icon: "TreePine" },
      {
        label: "Saplings Planted",
        value: 0,
        suffix: " (demo)",
        orderIndex: 3,
        icon: "Sprout",
      },
    ],
  });
  counts.statCounters = { created: 4, updated: 0, skipped: 0 };
}

/* -------------------------------- GALLERY -------------------------------- */

async function ensureDemoAsset(url: string, fileName: string) {
  const existing = await prisma.mediaAsset.findFirst({
    where: { url, folder: "demo-gallery" },
  });
  if (existing) return existing;
  return prisma.mediaAsset.create({
    data: {
      url,
      fileName,
      mimeType: "image/jpeg",
      sizeBytes: 250_000,
      alt: "Demo gallery image — replace with approved photograph",
      folder: "demo-gallery",
    },
  });
}

async function seedGalleries(counts: Counts) {
  const divisions = await requireDivisions();
  const targets = [divisions[0]!, divisions[3]!, divisions[6]!];

  const albums = [
    {
      slug: "demo-nursery-beds",
      title: "Nursery beds — demo album",
      description: "Placeholder album of nursery bed photos for gallery UI testing.",
    },
    {
      slug: "demo-field-inspection",
      title: "Field inspection — demo album",
      description: "Placeholder album for field inspection photographs.",
    },
    {
      slug: "demo-community-meeting",
      title: "Community meeting — demo album",
      description: "Placeholder album for community engagement photographs.",
    },
  ];

  const assets = await Promise.all(
    IMAGE_PATHS.map((url, idx) =>
      ensureDemoAsset(url, url.split("/").pop() ?? `demo-${idx}.jpg`)
    )
  );

  for (let i = 0; i < albums.length; i++) {
    const meta = albums[i]!;
    const division = targets[i]!;
    let album = await prisma.galleryAlbum.findFirst({
      where: { slug: meta.slug, divisionId: division.id },
    });

    if (album) {
      await prisma.galleryAlbum.update({
        where: { id: album.id },
        data: {
          title: meta.title,
          description: meta.description,
          coverImage: IMAGE_PATHS[i % IMAGE_PATHS.length],
          status: PublishStatus.PUBLISHED,
          orderIndex: i,
        },
      });
      bump(counts, "galleryAlbums", "updated");
      await prisma.galleryImage.deleteMany({ where: { albumId: album.id } });
    } else {
      album = await prisma.galleryAlbum.create({
        data: {
          slug: meta.slug,
          title: meta.title,
          description: meta.description,
          coverImage: IMAGE_PATHS[i % IMAGE_PATHS.length],
          status: PublishStatus.PUBLISHED,
          orderIndex: i,
          divisionId: division.id,
        },
      });
      bump(counts, "galleryAlbums", "created");
    }

    for (let j = 0; j < 4; j++) {
      await prisma.galleryImage.create({
        data: {
          albumId: album.id,
          assetId: assets[j % assets.length]!.id,
          caption: `Demo caption ${j + 1} — replace with a real caption`,
          orderIndex: j,
        },
      });
      bump(counts, "galleryImages", "created");
    }
  }
}

/* --------------------------------- MAIN ---------------------------------- */

async function main() {
  console.log("→ demo seed (placeholder content only)");
  const counts: Counts = {};

  await seedProjects(counts);
  await seedMedia(counts);
  await seedDownloads(counts);
  await seedContacts(counts);
  await seedStats(counts);
  await seedGalleries(counts);

  console.log("✓ demo seed complete");
  for (const [key, c] of Object.entries(counts)) {
    console.log(
      `  ${key}: created ${c.created}, updated ${c.updated}, skipped ${c.skipped}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
