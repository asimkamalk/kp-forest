import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const MIN_SUBMIT_MS = 3000;
export const SUBMIT_LIMIT = 3;
export const SUBMIT_WINDOW_MS = 60 * 60 * 1000;
export const TRACK_LIMIT = 10;
export const TRACK_WINDOW_MS = 60 * 60 * 1000;

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

type GuardBlock = { ok: false; error: string };

/** Rate limit + honeypot + minimum time-to-submit for public citizen forms. */
export async function guardCitizenSubmit(opts: {
  rateLimitKey: string;
  website?: string;
  formStartedAt: number;
}): Promise<GuardBlock | null> {
  const ip = await clientIp();
  const limited = rateLimit(
    `${opts.rateLimitKey}:${ip}`,
    SUBMIT_LIMIT,
    SUBMIT_WINDOW_MS
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `You can submit at most ${SUBMIT_LIMIT} requests per hour. Try again in ${limited.retryAfterSec} seconds.`,
    };
  }

  if (opts.website && opts.website.length > 0) {
    return { ok: false, error: "Rejected" };
  }

  const elapsed = Date.now() - opts.formStartedAt;
  if (elapsed < MIN_SUBMIT_MS || elapsed > 24 * 60 * 60 * 1000) {
    return {
      ok: false,
      error: "Please take a moment to complete the form, then submit again.",
    };
  }

  return null;
}

export async function generateTicketNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `KPFD-${year}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const latest = await prisma.publicRequest.findFirst({
      where: { ticketNo: { startsWith: prefix } },
      orderBy: { ticketNo: "desc" },
      select: { ticketNo: true },
    });
    let next = 1;
    if (latest) {
      const n = Number.parseInt(latest.ticketNo.slice(prefix.length), 10);
      if (!Number.isNaN(n)) next = n + 1;
    }
    const ticketNo = `${prefix}${String(next).padStart(5, "0")}`;
    const clash = await prisma.publicRequest.findUnique({
      where: { ticketNo },
      select: { id: true },
    });
    if (!clash) return ticketNo;
  }
  throw new Error("Could not allocate a ticket number");
}
