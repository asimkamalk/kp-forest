import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

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
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: "Only JPEG, PNG, WebP and GIF images are allowed" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "File must be 5MB or smaller" }, { status: 400 });
  }

  const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
  const absDir = path.isAbsolute(uploadDir)
    ? uploadDir
    : path.join(process.cwd(), uploadDir);
  await mkdir(absDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const absPath = path.join(absDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buffer);

  const publicUrl = `/uploads/${safeName}`;
  const asset = await prisma.mediaAsset.create({
    data: {
      url: publicUrl,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      folder: "uploads",
      uploadedBy: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, data: { url: asset.url, id: asset.id } });
}
