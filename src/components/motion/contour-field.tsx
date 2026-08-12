"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type Density = "sparse" | "medium" | "dense";

/** Deterministic contour bands. Density maps to real terrain, so it is data, not decoration. */
function bands(density: Density) {
  const count = { sparse: 6, medium: 11, dense: 16 }[density];
  const amp = { sparse: 14, medium: 30, dense: 46 }[density];
  return Array.from({ length: count }, (_, i) => {
    const y = 40 + i * (320 / count);
    const a = amp * (0.55 + 0.45 * Math.sin(i * 1.7));
    return `M0 ${y} C 120 ${y - a}, 240 ${y + a}, 400 ${y - a * 0.6} S 680 ${y + a * 0.8}, 800 ${y}`;
  });
}

export function ContourField({
  density = "medium",
  opacity = 0.14,
  parallax = 0,
  className = "",
}: {
  density?: Density;
  opacity?: number;
  parallax?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : parallax]);

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <motion.svg
        style={{ y }} viewBox="0 0 800 400" preserveAspectRatio="none"
        className="h-full w-full" fill="none"
      >
        {bands(density).map((d, i) => (
          <path key={i} d={d} stroke="currentColor" strokeWidth={0.75} opacity={opacity} />
        ))}
      </motion.svg>
    </div>
  );
}
