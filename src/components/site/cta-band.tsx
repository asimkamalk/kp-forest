"use client";

import Link from "next/link";
import { ContourField } from "@/components/motion/contour-field";
import { Reveal } from "@/components/motion/reveal";

export function CtaBand() {
  return (
    <section
      aria-labelledby="cta-band-heading"
      className="relative overflow-hidden bg-bark py-16 text-paper md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 text-mist">
        <ContourField density="dense" opacity={0.06} parallax={20} />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        <Reveal>
          <h2
            id="cta-band-heading"
            className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-paper"
          >
            Help grow Khyber Pakhtunkhwa&apos;s forests
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-moss">
            Request plants for your community, or speak to the department about a problem
            or idea.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/services/plant-request"
              className="inline-flex h-11 items-center justify-center rounded-[8px] bg-resin px-5 text-sm font-medium text-bark transition-colors hover:bg-paper"
            >
              Request plants
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-[8px] border border-mist px-5 text-sm font-medium text-paper transition-colors hover:bg-deodar"
            >
              Contact the department
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
