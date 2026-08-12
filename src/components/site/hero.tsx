import { getHeroSlides } from "@/lib/data/site";
import { HeroCarousel, type HeroSlideData } from "@/components/site/hero-carousel";

export async function Hero() {
  const slides = await getHeroSlides();
  if (slides.length === 0) return null;

  const data: HeroSlideData[] = slides.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt,
    ctaLabel: s.ctaLabel,
    ctaHref: s.ctaHref,
    secondaryCtaLabel: s.secondaryCtaLabel,
    secondaryCtaHref: s.secondaryCtaHref,
    overlayOpacity: s.overlayOpacity,
  }));

  return <HeroCarousel slides={data} />;
}
