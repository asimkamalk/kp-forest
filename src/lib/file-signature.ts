/** Detect image/document type from magic bytes — never trust the client MIME or extension alone. */

export type DetectedFile = {
  mimeType: string;
  extension: string;
  category: "image" | "document";
};

function startsWith(buf: Buffer, bytes: number[]): boolean {
  if (buf.length < bytes.length) return false;
  return bytes.every((b, i) => buf[i] === b);
}

function indexOfAscii(buf: Buffer, needle: string): number {
  return buf.indexOf(needle, 0, "utf8");
}

function detectOle(buf: Buffer): DetectedFile | null {
  // Compound File Binary (OLE): DOC / XLS
  if (!startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return null;

  // Stream names appear as ASCII in the directory sector.
  if (indexOfAscii(buf, "WordDocument") !== -1) {
    return {
      mimeType: "application/msword",
      extension: "doc",
      category: "document",
    };
  }
  if (indexOfAscii(buf, "Workbook") !== -1 || indexOfAscii(buf, "Book") !== -1) {
    return {
      mimeType: "application/vnd.ms-excel",
      extension: "xls",
      category: "document",
    };
  }
  return null;
}

function detectZipOoxml(buf: Buffer): DetectedFile | null {
  // ZIP local file header (OOXML packages)
  if (!(buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07))) {
    return null;
  }

  const hasContentTypes = indexOfAscii(buf, "[Content_Types].xml") !== -1;
  const hasWord = indexOfAscii(buf, "word/") !== -1;
  const hasXl = indexOfAscii(buf, "xl/") !== -1;

  if (hasWord && (hasContentTypes || indexOfAscii(buf, "word/document") !== -1)) {
    return {
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx",
      category: "document",
    };
  }
  if (hasXl && (hasContentTypes || indexOfAscii(buf, "xl/workbook") !== -1)) {
    return {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
      category: "document",
    };
  }
  return null;
}

export function detectFileSignature(buf: Buffer): DetectedFile | null {
  // JPEG
  if (startsWith(buf, [0xff, 0xd8, 0xff])) {
    return { mimeType: "image/jpeg", extension: "jpg", category: "image" };
  }
  // PNG
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mimeType: "image/png", extension: "png", category: "image" };
  }
  // GIF
  if (
    startsWith(buf, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(buf, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return { mimeType: "image/gif", extension: "gif", category: "image" };
  }
  // WEBP (RIFF....WEBP)
  if (
    startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    buf.length >= 12 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return { mimeType: "image/webp", extension: "webp", category: "image" };
  }
  // PDF
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46])) {
    return { mimeType: "application/pdf", extension: "pdf", category: "document" };
  }

  const ole = detectOle(buf);
  if (ole) return ole;

  const zip = detectZipOoxml(buf);
  if (zip) return zip;

  return null;
}
