"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { ContourField } from "@/components/motion/contour-field";
import { AnimatedHeading, Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type HeroSlideData = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  overlayOpacity: number;
};

const SLIDE_MS = 7000;
const FADE_MS = 900;

type Props = {
  slides: HeroSlideData[];
};

export function HeroCarousel({ slides }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const hoverRef = useRef(false);
  const hiddenRef = useRef(false);

  const count = slides.length;
  const active = slides[index] ?? slides[0];
  const remainingRef = useRef(SLIDE_MS);
  const startRef = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      remainingRef.current = SLIDE_MS;
      startRef.current = null;
      setIndex(((next % count) + count) % count);
      setProgressKey((k) => k + 1);
    },
    [count]
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    const syncPause = () => {
      setPaused(hoverRef.current || hiddenRef.current || !!reduce);
    };

    const onVisibility = () => {
      hiddenRef.current = document.visibilityState === "hidden";
      syncPause();
    };

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    syncPause();

    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [reduce]);

  useEffect(() => {
    if (reduce || count < 2) return;

    if (paused) {
      if (startRef.current != null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startRef.current));
        startRef.current = null;
      }
      return;
    }

    startRef.current = Date.now();
    const id = window.setTimeout(() => {
      remainingRef.current = SLIDE_MS;
      goNext();
    }, remainingRef.current);

    return () => {
      window.clearTimeout(id);
      if (startRef.current != null) {
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startRef.current));
        startRef.current = null;
      }
    };
  }, [paused, reduce, count, index, goNext, progressKey]);

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, goPrev, goNext]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured stories"
      data-hero-paused={paused || reduce ? "true" : "false"}
      className="relative isolate min-h-[70vh] w-full overflow-hidden bg-bark md:min-h-[88vh]"
      onMouseEnter={() => {
        hoverRef.current = true;
        setPaused(true);
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        if (!hiddenRef.current && !reduce) setPaused(false);
      }}
      onFocusCapture={() => {
        hoverRef.current = true;
        setPaused(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          hoverRef.current = false;
          if (!hiddenRef.current && !reduce) setPaused(false);
        }
      }}
    >
      <div className="absolute inset-0">
        {slides.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: isActive ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
                zIndex: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
              aria-hidden={!isActive}
            >
              <div
                className={cn(
                  "absolute inset-0 origin-center will-change-transform",
                  isActive && !reduce && "hero-kenburns"
                )}
                style={
                  isActive && !reduce
                    ? { animationDuration: `${SLIDE_MS}ms` }
                    : { transform: "scale(1)" }
                }
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageAlt ?? ""}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] text-mist">
        <ContourField density="medium" opacity={0.08} parallax={30} />
      </div>

      <div
        className="absolute inset-0 z-[3] bg-bark"
        style={{ opacity: Math.min(100, Math.max(0, active.overlayOpacity)) / 100 }}
        aria-hidden
      />

      <div className="relative z-[4] mx-auto flex h-full min-h-[70vh] max-w-[1200px] flex-col justify-end px-6 pb-28 pt-32 md:min-h-[88vh] md:pb-32">
        <div className="max-w-[640px]">
          <p className="eyebrow text-resin">Government of Khyber Pakhtunkhwa</p>

          <div className="mt-4" key={`title-${active.id}`}>
            <AnimatedHeading
              text={active.title}
              className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.02] text-paper"
              delay={0.05}
            />
          </div>

          {active.subtitle && (
            <Reveal key={`sub-${active.id}`} delay={0.4} className="mt-5">
              <p className="max-w-xl text-base leading-relaxed text-mist md:text-lg">
                {active.subtitle}
              </p>
            </Reveal>
          )}

          <Reveal key={`cta-${active.id}`} delay={0.6} className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              {active.ctaLabel && active.ctaHref && (
                <Link
                  href={active.ctaHref}
                  className="inline-flex h-11 items-center justify-center rounded-[8px] bg-resin px-5 text-sm font-medium text-bark transition-colors hover:bg-mist"
                >
                  {active.ctaLabel}
                </Link>
              )}
              {active.secondaryCtaLabel && active.secondaryCtaHref && (
                <Link
                  href={active.secondaryCtaHref}
                  className="inline-flex h-11 items-center justify-center rounded-[8px] border border-mist bg-transparent px-5 text-sm font-medium text-mist transition-colors hover:bg-mist/10 hover:text-paper"
                >
                  {active.secondaryCtaLabel}
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {count > 1 && (
        <div className="pointer-events-none absolute inset-y-0 z-[5] hidden w-full items-center justify-between px-4 md:flex">
          <button
            type="button"
            onClick={goPrev}
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-[8px] border border-mist/40 bg-bark/40 text-paper transition-colors hover:border-resin hover:text-resin focus-visible:border-resin focus-visible:text-resin"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-[8px] border border-mist/40 bg-bark/40 text-paper transition-colors hover:border-resin hover:text-resin focus-visible:border-resin focus-visible:text-resin"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      {count > 1 && (
        <div
          className="absolute inset-x-0 bottom-0 z-[5] flex gap-2 px-6 pb-5"
          role="tablist"
          aria-label="Slide progress"
        >
          {slides.map((slide, i) => {
            const isActive = i === index;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${i + 1}: ${slide.title}`}
                onClick={() => goTo(i)}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-mist/25"
              >
                <span
                  key={isActive ? `progress-${progressKey}` : `idle-${slide.id}`}
                  className={cn(
                    "absolute inset-y-0 left-0 bg-resin",
                    isActive && !reduce && "hero-progress",
                    isActive && reduce && "w-full",
                    !isActive && "w-0"
                  )}
                  style={
                    isActive && !reduce
                      ? { animationDuration: `${SLIDE_MS}ms` }
                      : undefined
                  }
                />
              </button>
            );
          })}
        </div>
      )}

      {!reduce && (
        <a
          href="#stats-band"
          className="hero-scroll-cue absolute bottom-10 left-1/2 z-[5] hidden text-mist md:block"
          aria-label="Scroll to statistics"
        >
          <ChevronDown className="h-6 w-6" aria-hidden />
        </a>
      )}
    </section>
  );
}
