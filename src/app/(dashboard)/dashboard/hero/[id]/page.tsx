import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HeroForm } from "@/components/dashboard/hero/hero-form";
import { toDateInput, type HeroSlideInput } from "@/lib/validators/hero";

type Props = { params: Promise<{ id: string }> };

export default async function EditHeroSlidePage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) notFound();

  const defaults: HeroSlideInput = {
    title: slide.title,
    titleUr: slide.titleUr,
    subtitle: slide.subtitle,
    subtitleUr: slide.subtitleUr,
    imageUrl: slide.imageUrl,
    imageAlt: slide.imageAlt,
    ctaLabel: slide.ctaLabel,
    ctaHref: slide.ctaHref,
    secondaryCtaLabel: slide.secondaryCtaLabel,
    secondaryCtaHref: slide.secondaryCtaHref,
    overlayOpacity: slide.overlayOpacity,
    orderIndex: slide.orderIndex,
    status: slide.status,
    startsAt: toDateInput(slide.startsAt) as unknown as Date | null,
    endsAt: toDateInput(slide.endsAt) as unknown as Date | null,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/hero" className="text-sm text-bark/60 hover:text-bark">
          ← Hero slides
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit slide</h1>
        <p className="mt-1 text-sm text-bark/60">{slide.title}</p>
      </div>
      <HeroForm mode="edit" slideId={slide.id} defaults={defaults} />
    </div>
  );
}
