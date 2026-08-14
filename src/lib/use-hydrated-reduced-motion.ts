"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * prefers-reduced-motion, safe for SSR.
 * Framer's useReducedMotion() is null on the server and a boolean on the
 * client's first paint, which changes the HTML tree (React #418).
 */
export function useHydratedReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
