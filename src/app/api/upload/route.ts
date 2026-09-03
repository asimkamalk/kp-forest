import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectFileSignature } from "@/lib/file-signature";
import { rateLimit } from "@/lib/rate-limit";
import { storePublicFile } from "@/lib/store-upload";

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const ip = await clientIp();
  const limited = rateLimit(`dashboard-upload:${session.user.id}:${ip}`, 60, 60 * 60 * 1000);
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
  if (!detected) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unrecognised file. Allowed: JPEG, PNG, WebP, GIF, PDF, DOC, DOCX, XLS, XLSX",
      },
      { status: 400 }
    );
  }

  const maxBytes = detected.category === "image" ? IMAGE_MAX_BYTES : DOCUMENT_MAX_BYTES;
  if (buffer.length > maxBytes) {
    const limitLabel = detected.category === "image" ? "5MB" : "20MB";
    return NextResponse.json(
      { ok: false, error: `File must be ${limitLabel} or smaller` },
      { status: 400 }
    );
  }

  try {
    const stored = await storePublicFile({
      buffer,
      extension: detected.extension,
      contentType: detected.mimeType,
      folder: detected.category === "document" ? "documents" : "uploads",
    });

    const asset = await prisma.mediaAsset.create({
      data: {
        url: stored.url,
        fileName: file.name,
        mimeType: detected.mimeType,
        sizeBytes: buffer.length,
        folder: detected.category === "document" ? "documents" : "uploads",
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        url: asset.url,
        id: asset.id,
        sizeBytes: asset.sizeBytes,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save file";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
