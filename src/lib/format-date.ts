/** Display dates in Pakistan time so SSR (UTC) and the browser match. */

const TZ = "Asia/Karachi";

export function formatDisplayDate(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

/** Date + time in Pakistan Standard Time (UTC+5). */
export function formatDisplayDateTime(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TZ,
  });
}
