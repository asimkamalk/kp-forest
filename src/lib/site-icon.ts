type IconSettings = {
  faviconUrl?: string | null;
  emblemUrl?: string | null;
  logoUrl?: string | null;
};

export function resolveSiteIconUrl(settings: IconSettings): string | null {
  const icon = settings.faviconUrl || settings.emblemUrl || settings.logoUrl;
  if (!icon) return null;
  if (/^https?:\/\//i.test(icon)) return icon;
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${icon.startsWith("/") ? icon : `/${icon}`}`;
}
