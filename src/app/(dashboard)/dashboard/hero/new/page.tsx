import Link from "next/link";
import { PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { HeroForm } from "@/components/dashboard/hero/hero-form";
import type { HeroSlideInput } from "@/lib/validators/hero";

const defaults: HeroSlideInput = {
  title: "",
  titleUr: "",
  subtitle: "",
  subtitleUr: "",
  imageUrl: "",
  imageAlt: "",
  ctaLabel: "",
  ctaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  overlayOpacity: 45,
  orderIndex: 0,
  status: PublishStatus.DRAFT,
  startsAt: null,
  endsAt: null,
};

export default async function NewHeroSlidePage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/hero" className="text-sm text-bark/60 hover:text-bark">
          ← Hero slides
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New slide</h1>
      </div>
      <HeroForm mode="create" defaults={defaults} />
    </div>
  );
}
