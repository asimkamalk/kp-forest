"use client";

import {
  motion,
  useInView,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";

/** Shared easing — one curve across the whole site keeps motion coherent. */
export const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET_PX = 28;

const offset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: OFFSET_PX },
  down: { x: 0, y: -OFFSET_PX },
  left: { x: OFFSET_PX, y: 0 },
  right: { x: -OFFSET_PX, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  direction = "up",
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
}) {
  const reduce = useHydratedReducedMotion();
  const { x, y } = offset[direction];

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        duration: reduce ? 0.2 : duration,
        delay: reduce ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Wrap a list; children animate in sequence. Use with <StaggerItem>. */
export function Stagger({
  children,
  className,
  gap = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
}) {
  const reduce = useHydratedReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : gap,
        delayChildren: reduce ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  const reduce = useHydratedReducedMotion();
  const { x, y } = offset[direction];

  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, x, y },
    show: {
      opacity: 1,
      ...(reduce ? {} : { x: 0, y: 0 }),
      transition: {
        duration: reduce ? 0.2 : 0.6,
        ease: EASE,
      },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** Display heading. Animation stays on transform of the wrapper, never the tag tree. */
export function AnimatedHeading({
  text,
  className,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return <h1 className={className}>{text}</h1>;
}

/** Counts 0 → value on viewport entry. Always settles on `value` (no missed spring events). */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useHydratedReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const places = Number.isInteger(value)
    ? 0
    : Math.min(2, (String(value).split(".")[1] ?? "").length || 1);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    const duration = 900;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const current = value * eased;
      const next =
        places === 0 ? Math.round(current) : Number(current.toFixed(places));
      setDisplay(next);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(tick);
    const safety = window.setTimeout(() => setDisplay(value), duration + 200);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(safety);
    };
  }, [inView, value, reduce, places]);

  return (
    <span
      ref={ref}
      suppressHydrationWarning
      className={`data font-mono tabular-nums ${className ?? ""}`.trim()}
    >
      {prefix}
      {display.toLocaleString("en-GB", {
        minimumFractionDigits: places > 0 ? Math.min(places, 1) : 0,
        maximumFractionDigits: places,
      })}
      {suffix}
    </span>
  );
}
