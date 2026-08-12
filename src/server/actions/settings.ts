"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteSettingSchema } from "@/lib/validators/admin";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

async function writeAudit(
  userId: string,
  action: string,
  before: unknown,
  after: unknown
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity: "SiteSetting",
      entityId: "singleton",
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function updateSiteSettings(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = siteSettingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const before =
    (await prisma.siteSetting.findUnique({ where: { id: "singleton" } })) ??
    (await prisma.siteSetting.create({ data: { id: "singleton" } }));

  try {
    const row = await prisma.siteSetting.update({
      where: { id: "singleton" },
      data: {
        siteName: parsed.data.siteName,
        siteNameUr: parsed.data.siteNameUr ?? null,
        tagline: parsed.data.tagline ?? null,
        taglineUr: parsed.data.taglineUr ?? null,
        logoUrl: parsed.data.logoUrl ?? null,
        faviconUrl: parsed.data.faviconUrl ?? null,
        emblemUrl: parsed.data.emblemUrl ?? null,
        address: parsed.data.address ?? null,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        helplineNumber: parsed.data.helplineNumber ?? null,
        footerNote: parsed.data.footerNote ?? null,
        googleAnalytics: parsed.data.googleAnalytics ?? null,
        maintenanceMode: parsed.data.maintenanceMode,
      },
    });
    await writeAudit(session.user.id, "UPDATE", before, row);
    revalidateTag("settings", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not save settings");
  }
}
