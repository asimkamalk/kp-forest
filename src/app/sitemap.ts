import type { MetadataRoute } from "next";
import { MediaKind, PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PUBLISHED = { status: PublishStatus.PUBLISHED } as const;

/** CMS Page.slug → public path (only rows that map to a dedicated URL). */
const PAGE_SLUG_PATHS: Record<string, string> = {
  about: "/about",
  "vision-mission": "/about/vision-mission",
  "functions-mandate": "/about/mandate",
};

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about/vision-mission", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about/mandate", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about/organogram", changeFrequency: "monthly", priority: 0.6 },
  { path: "/messages", changeFrequency: "weekly", priority: 0.8 },
  { path: "/regions", changeFrequency: "weekly", priority: 0.9 },
  { path: "/projects/ongoing", changeFrequency: "weekly", priority: 0.8 },
  { path: "/projects/completed", changeFrequency: "weekly", priority: 0.7 },
  { path: "/projects/future", changeFrequency: "weekly", priority: 0.7 },
  { path: "/downloads/publications", changeFrequency: "weekly", priority: 0.7 },
  { path: "/downloads/notifications", changeFrequency: "weekly", priority: 0.7 },
  { path: "/downloads/acts-rules-policies", changeFrequency: "monthly", priority: 0.6 },
  { path: "/media/press-releases", changeFrequency: "daily", priority: 0.8 },
  { path: "/media/photos", changeFrequency: "weekly", priority: 0.7 },
  { path: "/media/videos", changeFrequency: "weekly", priority: 0.7 },
  { path: "/media/news", changeFrequency: "daily", priority: 0.7 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/plant-request", changeFrequency: "monthly", priority: 0.7 },
  { path: "/services/research-request", changeFrequency: "monthly", priority: 0.7 },
  { path: "/services/emergency-contacts", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact/complaint", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact/suggestion", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact/track", changeFrequency: "monthly", priority: 0.5 },
  { path: "/know-your-forest", changeFrequency: "weekly", priority: 0.7 },
  { path: "/wildlife", changeFrequency: "weekly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((s) => ({
    url: `${base}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  const [pages, messages, projects, press, albums, kyf, regions] =
    await Promise.all([
      prisma.page.findMany({
        where: PUBLISHED,
        select: { slug: true, updatedAt: true },
      }),
      prisma.message.findMany({
        where: PUBLISHED,
        select: { slug: true, updatedAt: true },
      }),
      prisma.project.findMany({
        where: PUBLISHED,
        select: { slug: true, updatedAt: true },
      }),
      prisma.mediaPost.findMany({
        where: { ...PUBLISHED, kind: MediaKind.PRESS_RELEASE },
        select: { slug: true, updatedAt: true },
      }),
      prisma.galleryAlbum.findMany({
        where: PUBLISHED,
        select: { slug: true, updatedAt: true },
      }),
      prisma.knowYourForestArticle.findMany({
        where: PUBLISHED,
        select: { slug: true, updatedAt: true },
      }),
      prisma.region.findMany({
        where: PUBLISHED,
        select: {
          slug: true,
          updatedAt: true,
          circles: {
            where: PUBLISHED,
            select: {
              slug: true,
              updatedAt: true,
              divisions: {
                where: PUBLISHED,
                select: { slug: true, updatedAt: true },
              },
            },
          },
        },
      }),
    ]);

  for (const page of pages) {
    const path = PAGE_SLUG_PATHS[page.slug];
    if (!path) continue;
    const existing = entries.find((e) => e.url === `${base}${path}`);
    if (existing) {
      existing.lastModified = page.updatedAt;
    } else {
      entries.push({
        url: `${base}${path}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const m of messages) {
    entries.push({
      url: `${base}/messages/${m.slug}`,
      lastModified: m.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const p of projects) {
    entries.push({
      url: `${base}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const post of press) {
    entries.push({
      url: `${base}/media/press-releases/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const album of albums) {
    entries.push({
      url: `${base}/media/photos/${album.slug}`,
      lastModified: album.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const article of kyf) {
    entries.push({
      url: `${base}/know-your-forest/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const region of regions) {
    entries.push({
      url: `${base}/regions/${region.slug}`,
      lastModified: region.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const circle of region.circles) {
      entries.push({
        url: `${base}/regions/${region.slug}/${circle.slug}`,
        lastModified: circle.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      for (const division of circle.divisions) {
        entries.push({
          url: `${base}/regions/${region.slug}/${circle.slug}/${division.slug}`,
          lastModified: division.updatedAt,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
