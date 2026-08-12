import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import type { SiteSettingInput } from "@/lib/validators/admin";

export default async function SettingsDashboardPage() {
  await requireRole(Role.SUPER_ADMIN);

  const settings =
    (await prisma.siteSetting.findUnique({ where: { id: "singleton" } })) ??
    (await prisma.siteSetting.create({ data: { id: "singleton" } }));

  const defaults: SiteSettingInput = {
    siteName: settings.siteName,
    siteNameUr: settings.siteNameUr,
    tagline: settings.tagline,
    taglineUr: settings.taglineUr,
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    emblemUrl: settings.emblemUrl,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    helplineNumber: settings.helplineNumber,
    footerNote: settings.footerNote,
    googleAnalytics: settings.googleAnalytics,
    maintenanceMode: settings.maintenanceMode,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <p className="eyebrow text-resin">Settings</p>
        <h1 className="mt-1 font-display text-2xl text-bark">Site settings</h1>
        <p className="mt-2 text-sm text-moss">
          Global site identity, contact details and maintenance mode.
        </p>
      </div>
      <SettingsForm defaults={defaults} />
    </div>
  );
}
