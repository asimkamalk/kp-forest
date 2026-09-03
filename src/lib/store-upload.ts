import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

function uploadRoot(): string {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "public", "uploads");
}

function resolveUnderRoot(root: string, ...segments: string[]): string | null {
  const resolved = path.resolve(root, ...segments);
  const normalized = path.resolve(root);
  const prefix = normalized.endsWith(path.sep) ? normalized : normalized + path.sep;
  if (resolved !== normalized && !resolved.startsWith(prefix)) return null;
  return resolved;
}

export async function storePublicFile(input: {
  buffer: Buffer;
  extension: string;
  contentType: string;
  folder?: string;
}): Promise<{ url: string }> {
  const folder = input.folder?.replace(/^\/+|\/+$/g, "") || "uploads";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${input.extension}`;
  const pathname = folder === "uploads" ? safeName : `${folder}/${safeName}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const blob = await put(pathname, input.buffer, {
      access: "public",
      token,
      contentType: input.contentType,
    });
    return { url: blob.url };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Image storage is not configured on Vercel. Create a Blob store in the project Storage tab, then redeploy."
    );
  }

  const root = uploadRoot();
  const segments = pathname.split("/").filter(Boolean);
  const absPath = resolveUnderRoot(root, ...segments);
  if (!absPath) {
    throw new Error("Invalid upload path");
  }

  await mkdir(path.dirname(absPath), { recursive: true });
  await writeFile(absPath, input.buffer);

  const publicPath = `/uploads/${pathname}`.replace(/\/{2,}/g, "/");
  return { url: publicPath };
}
