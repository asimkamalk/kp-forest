import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectFileSignature } from "@/lib/file-signature";

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
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

  const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
  const absDir = path.isAbsolute(uploadDir)
    ? uploadDir
    : path.join(process.cwd(), uploadDir);
  await mkdir(absDir, { recursive: true });

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected.extension}`;
  const absPath = path.join(absDir, safeName);
  await writeFile(absPath, buffer);

  const publicUrl = `/uploads/${safeName}`;
  const asset = await prisma.mediaAsset.create({
    data: {
      url: publicUrl,
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
}
