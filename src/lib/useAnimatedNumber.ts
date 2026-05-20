"use client";

/**
 * useAnimatedNumber — tweens a numeric target value from a previous value
 * to its new value using requestAnimationFrame and an easeOutQuad curve.
 *
 * Returns the current displayed number. Suitable for headline metric
 * counters (kWh / kWp / kg CO₂ / € savings / payback years). Cheap and
 * dependency-free.
 */

import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION = 900; // ms

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function useAnimatedNumber(
  target: number,
  duration: number = DEFAULT_DURATION,
): number {
  const [display, setDisplay] = useState<number>(target);
  const fromRef = useRef<number>(target);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // No tween on the very first render — show the target immediately.
    if (fromRef.current === target) return;

    const from = display; // animate from whatever's currently displayed
    fromRef.current = target;
    startRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutQuad(t);
      setDisplay(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // We intentionally only re-run when `target` changes — `display`
    // is read inside the effect but should not trigger a restart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}
