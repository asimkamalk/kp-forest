import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { detectFileSignature } from "@/lib/file-signature";
import { rateLimit } from "@/lib/rate-limit";
import { storePublicFile } from "@/lib/store-upload";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "pdf"]);

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

/** Unauthenticated attachment upload for contact forms — images and PDF only. */
export async function POST(request: Request) {
  const ip = await clientIp();
  const limited = rateLimit(`contact-upload:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Upload limit reached. Try again in ${limited.retryAfterSec} seconds.`,
      },
      { status: 429 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectFileSignature(buffer);
  if (
    !detected ||
    !ALLOWED_EXT.has(detected.extension) ||
    (detected.category === "document" && detected.extension !== "pdf")
  ) {
    return NextResponse.json(
      { ok: false, error: "Only JPEG, PNG, WebP, GIF and PDF files are allowed" },
      { status: 400 }
    );
  }

  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File must be 5MB or smaller" },
      { status: 400 }
    );
  }

  try {
    const stored = await storePublicFile({
      buffer,
      extension: detected.extension,
      contentType: detected.mimeType,
      folder: "contact",
    });

    const asset = await prisma.mediaAsset.create({
      data: {
        url: stored.url,
        fileName: file.name.slice(0, 200),
        mimeType: detected.mimeType,
        sizeBytes: buffer.length,
        folder: "contact",
      },
    });

    return NextResponse.json({
      ok: true,
      data: { url: asset.url, id: asset.id, sizeBytes: asset.sizeBytes },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save file";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
