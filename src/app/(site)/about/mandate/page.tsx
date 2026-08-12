import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutProseLayout } from "@/components/site/about/about-prose-layout";
import { getPageBySlug } from "@/lib/data/site";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("functions-mandate");
  if (!page) return { title: "Functions & mandate" };
  return {
    title: page.seoTitle ?? `${page.title} | About`,
    description: page.seoDescription ?? page.summary ?? undefined,
    openGraph: {
      title: page.title,
      description: page.summary ?? undefined,
      images: page.coverImage ? [{ url: page.coverImage }] : undefined,
    },
  };
}

export default async function MandatePage() {
  const page = await getPageBySlug("functions-mandate");
  if (!page) notFound();

  return (
    <AboutProseLayout
      page={page}
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { label: page.title },
      ]}
    />
  );
}
