import { getSiteSettings } from "@/lib/data/site";

function toAbsolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const contentType = "image/png";

/** Serves /icon from Site settings (favicon, then emblem, then logo). */
export default async function Icon() {
  const settings = await getSiteSettings();
  const src = settings.faviconUrl || settings.emblemUrl || settings.logoUrl;
  if (!src) {
    return new Response(null, { status: 404 });
  }

  const res = await fetch(toAbsolute(src), { cache: "no-store" });
  if (!res.ok) {
    return new Response(null, { status: 404 });
  }

  const body = await res.arrayBuffer();
  const type = res.headers.get("content-type") ?? "image/png";
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
