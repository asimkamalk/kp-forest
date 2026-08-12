import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { detectFileSignature } from "@/lib/file-signature";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "pdf"]);
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

function resolveUnderUploadRoot(...segments: string[]): string | null {
  const resolved = path.resolve(UPLOAD_ROOT, ...segments);
  const root = path.resolve(UPLOAD_ROOT);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (resolved !== root && !resolved.startsWith(prefix)) return null;
  return resolved;
}

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

  const contactDir = resolveUnderUploadRoot("contact");
  if (!contactDir) {
    return NextResponse.json({ ok: false, error: "Invalid upload path" }, { status: 400 });
  }
  await mkdir(contactDir, { recursive: true });

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected.extension}`;
  const absPath = resolveUnderUploadRoot("contact", safeName);
  if (!absPath) {
    return NextResponse.json({ ok: false, error: "Invalid upload path" }, { status: 400 });
  }
  await writeFile(absPath, buffer);

  const publicUrl = `/uploads/contact/${safeName}`;
  const asset = await prisma.mediaAsset.create({
    data: {
      url: publicUrl,
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
}
