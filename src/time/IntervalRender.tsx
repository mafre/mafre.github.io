import React, { useCallback, useEffect, useRef, useState } from "react";

export interface IntervalRenderInfo {
  tick: number;    // incrementing counter starting at 0 (or 1 if immediate=true)
  now: Date;      // Date at the moment of the tick
  elapsed: number; // ms since the component mounted (or since resetKey changed)
  setNow: (d: Date) => void; // function to update 'now' manually
}

/**
 * Props for IntervalRender.
 * Provides a controlled re-render at (roughly) fixed intervals with drift correction.
 */
export interface IntervalRenderProps {
  /** Interval in milliseconds. Values < 16 are clamped to 16 (about one frame @60Hz). */
  interval: number;
  /**
   * Render function (function-as-children pattern) receiving timing info.
   * tick: incrementing counter starting at 0 (or 1 if immediate=true).\n
   * now: Date at the moment of the tick.\n
   * elapsed: ms since the component mounted (or since resetKey changed).\n
   */
  children: (info: IntervalRenderInfo) => React.ReactNode;
  /** Whether the timer is active. Default true. */
  running?: boolean;
  /** If true, perform an immediate initial tick before waiting for first interval. */
  immediate?: boolean;
  /**
   * Align the first tick to a boundary. Examples: "second", "minute", or a number of ms.
   * Only applies if immediate === false (since immediate triggers right away). If omitted, starts now.
   */
  align?: "second" | "minute" | number;
  /**
   * Changing this key resets internal timers & counters (useful when external params change).
   */
  resetKey?: unknown;
  /** Optional callback every tick (side-effects separate from render). */
  onTick?: (info: { tick: number; now: Date; elapsed: number }) => void;

  onUpdate?: (info: { tick: number; now: Date; elapsed: number }) => void;
}

/**
 * IntervalRender: re-renders its function child on a fixed interval with drift correction.
 *
 * Why not setInterval? setInterval accumulates drift over time. We instead chain setTimeout
 * calls based on the *scheduled* next fire time so drift is bounded.
 */
export function IntervalRender({
  interval,
  children,
  running = true,
  immediate = false,
  align,
  resetKey,
  onTick,
  onUpdate
}: IntervalRenderProps) {
  const clampedInterval = Math.max(16, Math.floor(interval));
  const [tick, setTick] = useState(() => (immediate ? 0 : -1));
  const [now, setNow] = useState(() => new Date());
  const startPerfRef = useRef<number>(performance.now());
  const startDateRef = useRef<Date>(new Date());
  const nextFireRef = useRef<number>(0);
  const timerIdRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  const scheduleNext = useCallback(() => {
    if (!running) return;
    const nowPerf = performance.now();
    const delay = Math.max(0, nextFireRef.current - nowPerf);
    timerIdRef.current = window.setTimeout(() => {
      // Perform tick
      const tNow = new Date();
      setNow(tNow);
      setTick((t) => t + 1);

      const next = nextFireRef.current + clampedInterval; // schedule based on theoretical time
      nextFireRef.current = next;

      // Fire side-effect callback *after* state updates queued.
      const info = {
        tick: (tickRef.current ?? 0) + 1, // approximate upcoming tick count
        now: tNow,
        elapsed: tNow.getTime() - startDateRef.current.getTime(),
      };
      onTick?.(info);
      onUpdate?.(info);

      scheduleNext();
    }, delay);
  }, [running, clampedInterval, onTick]);

  // Keep a ref to tick for onTick computation (since setState is async)
  const tickRef = useRef<number>(tick);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // Reset logic when resetKey, interval, running, align, or immediate changes meaningfully.
  useEffect(() => {
    clearTimer();

    startPerfRef.current = performance.now();
    startDateRef.current = new Date();

    // Establish initial nextFireRef considering alignment.
    const basePerf = startPerfRef.current;
    let firstDelay = 0;

    if (!immediate) {
      if (align) {
        const alignMs =
          align === "second" ? 1000 : align === "minute" ? 60_000 : Math.max(1, Number(align));
        const nowDate = startDateRef.current.getTime();
        const nextAligned = Math.ceil(nowDate / alignMs) * alignMs; // next boundary
        firstDelay = nextAligned - nowDate;
      } else {
        firstDelay = clampedInterval;
      }
    }

    nextFireRef.current = basePerf + firstDelay;
    setTick(immediate ? 0 : -1);
    setNow(startDateRef.current);

    if (running) {
      if (immediate) {
        // Trigger immediate tick effect.
        setTick(0);
        onTick?.({ tick: 0, now: startDateRef.current, elapsed: 0 });
        nextFireRef.current = basePerf + clampedInterval; // next after immediate
      }
      scheduleNext();
    }

    return clearTimer;
  }, [resetKey, clampedInterval, running, align, immediate, scheduleNext, onTick]);

  const elapsed = now.getTime() - startDateRef.current.getTime();
  const effectiveTick = Math.max(0, tick); // hide the -1 (pre-first) from consumers

  return <>{children({ tick: effectiveTick, now, elapsed, setNow })}</>;
}

export default IntervalRender;
