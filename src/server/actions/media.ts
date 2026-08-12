"use server";

import { revalidateTag } from "next/cache";
import { MediaKind, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { galleryAlbumWhere } from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import {
  addGalleryImagesSchema,
  galleryAlbumSchema,
  galleryImageCaptionSchema,
  mediaVideoSchema,
  newsCoverageSchema,
  pressReleaseSchema,
  reorderSchema,
} from "@/lib/validators/media";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

const CONTENT_ROLES = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
  Role.EDITOR,
] as const;

async function writeAudit(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  before: unknown,
  after: unknown
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

/* ----------------------------- MediaPost CRUD ---------------------------- */

export async function createPressRelease(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = pressReleaseSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.mediaPost.create({
      data: { ...parsed.data, kind: MediaKind.PRESS_RELEASE },
    });
    await writeAudit(session.user.id, "CREATE", "MediaPost", row.id, null, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create press release";
    return actionError(message);
  }
}

export async function updatePressRelease(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = pressReleaseSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.mediaPost.findUnique({ where: { id } });
  if (!before || before.kind !== MediaKind.PRESS_RELEASE) {
    return actionError("Press release not found");
  }

  try {
    const row = await prisma.mediaPost.update({
      where: { id },
      data: { ...parsed.data, kind: MediaKind.PRESS_RELEASE },
    });
    await writeAudit(session.user.id, "UPDATE", "MediaPost", row.id, before, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update press release";
    return actionError(message);
  }
}

export async function createNewsCoverage(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = newsCoverageSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.mediaPost.create({
      data: { ...parsed.data, kind: MediaKind.NEWS_COVERAGE },
    });
    await writeAudit(session.user.id, "CREATE", "MediaPost", row.id, null, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create news item";
    return actionError(message);
  }
}

export async function updateNewsCoverage(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = newsCoverageSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.mediaPost.findUnique({ where: { id } });
  if (!before || before.kind !== MediaKind.NEWS_COVERAGE) {
    return actionError("News item not found");
  }

  try {
    const row = await prisma.mediaPost.update({
      where: { id },
      data: { ...parsed.data, kind: MediaKind.NEWS_COVERAGE },
    });
    await writeAudit(session.user.id, "UPDATE", "MediaPost", row.id, before, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update news item";
    return actionError(message);
  }
}

export async function createVideoPost(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = mediaVideoSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.mediaPost.create({
      data: { ...parsed.data, kind: MediaKind.INTERVIEW },
    });
    await writeAudit(session.user.id, "CREATE", "MediaPost", row.id, null, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create video";
    return actionError(message);
  }
}

export async function updateVideoPost(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = mediaVideoSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.mediaPost.findUnique({ where: { id } });
  if (!before || !before.videoUrl) return actionError("Video not found");

  try {
    const row = await prisma.mediaPost.update({
      where: { id },
      data: { ...parsed.data, kind: MediaKind.INTERVIEW },
    });
    await writeAudit(session.user.id, "UPDATE", "MediaPost", row.id, before, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update video";
    return actionError(message);
  }
}

export async function deleteMediaPost(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.mediaPost.findUnique({ where: { id } });
  if (!before) return actionError("Post not found");

  try {
    await prisma.mediaPost.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", "MediaPost", id, before, null);
    revalidateTag("media", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete post";
    return actionError(message);
  }
}

export async function publishMediaPost(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.mediaPost.findUnique({ where: { id } });
  if (!before) return actionError("Post not found");

  try {
    const row = await prisma.mediaPost.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await writeAudit(session.user.id, "PUBLISH", "MediaPost", id, before, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not publish post";
    return actionError(message);
  }
}

/* ----------------------------- Gallery albums ---------------------------- */

export async function createGalleryAlbum(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = galleryAlbumSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.galleryAlbum.create({ data: parsed.data });
    await writeAudit(session.user.id, "CREATE", "GalleryAlbum", row.id, null, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create album";
    return actionError(message);
  }
}

export async function updateGalleryAlbum(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = galleryAlbumSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.galleryAlbum.findFirst({
    where: { id, ...galleryAlbumWhere(session) },
  });
  if (!before) return actionError("Album not found");

  try {
    const row = await prisma.galleryAlbum.update({ where: { id }, data: parsed.data });
    await writeAudit(session.user.id, "UPDATE", "GalleryAlbum", row.id, before, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update album";
    return actionError(message);
  }
}

export async function deleteGalleryAlbum(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.galleryAlbum.findFirst({
    where: { id, ...galleryAlbumWhere(session) },
  });
  if (!before) return actionError("Album not found");

  try {
    await prisma.galleryAlbum.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", "GalleryAlbum", id, before, null);
    revalidateTag("media", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete album";
    return actionError(message);
  }
}

export async function addGalleryImages(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = addGalleryImagesSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const album = await prisma.galleryAlbum.findFirst({
    where: { id: parsed.data.albumId, ...galleryAlbumWhere(session) },
    include: { _count: { select: { images: true } } },
  });
  if (!album) return actionError("Album not found");

  try {
    let orderIndex = album._count.images;
    const created = [];
    for (const assetId of parsed.data.assetIds) {
      const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
      if (!asset) continue;
      const img = await prisma.galleryImage.create({
        data: {
          albumId: album.id,
          assetId,
          orderIndex: orderIndex++,
        },
      });
      created.push(img);
    }
    await writeAudit(session.user.id, "CREATE", "GalleryImage", album.id, null, {
      added: created.length,
    });
    revalidateTag("media", "max");
    return actionOk({ count: created.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not add images";
    return actionError(message);
  }
}

export async function reorderGalleryImages(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return actionError("Invalid order payload");

  const albumId = parsed.data.parentId;
  if (!albumId) return actionError("Album is required");

  const album = await prisma.galleryAlbum.findFirst({
    where: { id: albumId, ...galleryAlbumWhere(session) },
  });
  if (!album) return actionError("Album not found");

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, orderIndex) =>
        prisma.galleryImage.update({ where: { id }, data: { orderIndex } })
      )
    );
    await writeAudit(session.user.id, "UPDATE", "GalleryImage", albumId, null, {
      orderedIds: parsed.data.orderedIds,
    });
    revalidateTag("media", "max");
    return actionOk({ count: parsed.data.orderedIds.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reorder images";
    return actionError(message);
  }
}

export async function updateGalleryImageCaption(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = galleryImageCaptionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const image = await prisma.galleryImage.findUnique({
    where: { id },
    include: { album: true },
  });
  if (!image) return actionError("Image not found");

  const album = await prisma.galleryAlbum.findFirst({
    where: { id: image.albumId, ...galleryAlbumWhere(session) },
  });
  if (!album) return actionError("Album not found");

  try {
    const row = await prisma.galleryImage.update({
      where: { id },
      data: {
        caption: parsed.data.caption ?? null,
        captionUr: parsed.data.captionUr ?? null,
      },
    });
    await writeAudit(session.user.id, "UPDATE", "GalleryImage", id, image, row);
    revalidateTag("media", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update caption";
    return actionError(message);
  }
}

export async function deleteGalleryImage(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) return actionError("Image not found");

  const album = await prisma.galleryAlbum.findFirst({
    where: { id: image.albumId, ...galleryAlbumWhere(session) },
  });
  if (!album) return actionError("Album not found");

  try {
    await prisma.galleryImage.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", "GalleryImage", id, image, null);
    revalidateTag("media", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete image";
    return actionError(message);
  }
}
