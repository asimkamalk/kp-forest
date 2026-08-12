import type { Metadata } from "next";

/** Shared page metadata helper for static public routes. */
export function pageMeta(
  title: string,
  description?: string,
  path?: string
): Metadata {
  const fullTitle = title.includes("|")
    ? title
    : `${title} | Forest Department, KP`;
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: path,
    },
  };
}
