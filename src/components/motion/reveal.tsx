"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const reduce = useReducedMotion();
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
  const reduce = useReducedMotion();

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
  const reduce = useReducedMotion();
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

/** Word-by-word headline animation (display face on the consumer). */
export function AnimatedHeading({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.7, ease: EASE },
              },
            }}
          >
            {word}
            {"\u00A0"}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}

/** Springs from 0 → value on viewport entry. Mono + tabular-nums. */
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
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 22, mass: 0.8 });
  const places = Number.isInteger(value)
    ? 0
    : Math.min(2, (String(value).split(".")[1] ?? "").length || 1);
  const [display, setDisplay] = useState(reduce ? value : 0);

  useMotionValueEvent(spring, "change", (latest) => {
    const next = places === 0 ? Math.round(latest) : Number(latest.toFixed(places));
    setDisplay(next);
  });

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, reduce, motionValue]);

  const shown = reduce ? value : display;

  return (
    <span ref={ref} className={`data font-mono tabular-nums ${className ?? ""}`.trim()}>
      {prefix}
      {shown.toLocaleString(undefined, {
        minimumFractionDigits: places > 0 ? Math.min(places, 1) : 0,
        maximumFractionDigits: places,
      })}
      {suffix}
    </span>
  );
}
