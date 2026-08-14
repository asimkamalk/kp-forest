"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { EASE } from "@/components/motion/reveal";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";

/** Single contour line between major sections — draws in on scroll. */
export function SectionDivider({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useHydratedReducedMotion();

  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden>
      <svg
        ref={ref}
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="h-12 w-full text-mist"
        fill="none"
      >
        <motion.path
          d="M0 24 C 150 8, 300 40, 450 24 S 750 8, 900 28 S 1050 40, 1200 24"
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={
            reduce || inView
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 1 }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1.4, ease: EASE }
          }
        />
      </svg>
    </div>
  );
}
