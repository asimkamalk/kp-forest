"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

/**
 * Smooth scroll via Lenis. Fully disabled when the user prefers reduced motion.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onChange = () => {
      if (media.matches) {
        cancelAnimationFrame(frame);
        lenis.destroy();
      }
    };
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
