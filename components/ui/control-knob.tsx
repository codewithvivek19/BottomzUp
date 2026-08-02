"use client";

/**
 * Reactor / heat control knob — reference React component (shadcn + Tailwind + framer-motion).
 *
 * This static Bottomz Up site does NOT run React. The live integration is vanilla:
 *   css/control-knob.css + js/control-knob.js → Wings Sauce Meter section.
 *
 * To use THIS file in a real React app:
 *   1. Create Next.js app with TypeScript + Tailwind
 *   2. npx shadcn@latest init  (default components → components/ui)
 *   3. Ensure @/lib/utils has cn()
 *   4. npm i framer-motion
 *   5. Import from @/components/ui/control-knob
 *
 * Light-mode brand defaults (cream + amber) — not the original dark reactor.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

// Optional: if you have shadcn cn helper
// import { cn } from "@/lib/utils";

export type ControlKnobProps = {
  /** 0–100 */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
  className?: string;
  label?: string;
};

const MIN_DEG = -135;
const MAX_DEG = 135;
const TOTAL_TICKS = 40;
const DEGREES_PER_TICK = (MAX_DEG - MIN_DEG) / TOTAL_TICKS;

function valueToDeg(v: number) {
  const t = Math.min(100, Math.max(0, v)) / 100;
  return MIN_DEG + t * (MAX_DEG - MIN_DEG);
}

function degToValue(d: number) {
  return ((d - MIN_DEG) / (MAX_DEG - MIN_DEG)) * 100;
}

export default function ControlKnob({
  value,
  defaultValue = 37,
  onChange,
  onCommit,
  className = "",
  label = "HEAT",
}: ControlKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);

  const initial = value ?? defaultValue;
  const rawRotation = useMotionValue(valueToDeg(initial));
  const snappedRotation = useMotionValue(valueToDeg(initial));
  const smoothRotation = useSpring(snappedRotation, {
    stiffness: 400,
    damping: 35,
    mass: 0.8,
  });

  const displayValue = useTransform(smoothRotation, [MIN_DEG, MAX_DEG], [0, 100]);
  const lightOpacity = useTransform(rawRotation, [MIN_DEG, MAX_DEG], [0.08, 0.45]);
  const indicatorGlow = useTransform(rawRotation, (r) => {
    const p = degToValue(r);
    return `0 0 ${Math.max(4, p / 8)}px rgba(231, 147, 30, 0.85)`;
  });

  // Controlled sync
  useEffect(() => {
    if (value == null || isDragging) return;
    const deg = valueToDeg(value);
    rawRotation.set(deg);
    snappedRotation.set(deg);
  }, [value, isDragging, rawRotation, snappedRotation]);

  useMotionValueEvent(displayValue, "change", (latest) => {
    if (isDragging) onChange?.(Math.round(latest));
  });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      let degs = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (degs > 180) degs -= 360;
      if (degs < MIN_DEG) degs = MIN_DEG;
      if (degs > MAX_DEG) degs = MAX_DEG;

      rawRotation.set(degs);
      const snap = Math.round(degs / DEGREES_PER_TICK) * DEGREES_PER_TICK;
      snappedRotation.set(snap);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      onCommit?.(Math.round(degToValue(snappedRotation.get())));
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, rawRotation, snappedRotation, onCommit]);

  const ticks = Array.from({ length: TOTAL_TICKS + 1 });

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      data-control-knob
    >
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 select-none">
        {/* Soft amber glow (light mode) */}
        <motion.div
          className="absolute inset-6 rounded-full bg-amber-400 blur-3xl pointer-events-none"
          style={{ opacity: lightOpacity }}
        />

        {/* Tick ring */}
        <div className="absolute inset-0 pointer-events-none">
          {ticks.map((_, i) => {
            const angle = (i / TOTAL_TICKS) * (MAX_DEG - MIN_DEG) + MIN_DEG;
            return (
              <div
                key={i}
                className="absolute top-0 left-1/2 w-1 h-full -translate-x-1/2"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <TickMark currentRotation={smoothRotation} angle={angle} />
              </div>
            );
          })}
        </div>

        {/* Knob body */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-40 sm:h-40">
          <motion.div
            ref={knobRef}
            className={`relative w-full h-full rounded-full touch-none z-20 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ rotate: smoothRotation }}
            onPointerDown={handlePointerDown}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
            tabIndex={0}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#fffdf9] to-[#f5e8b7] shadow-[0_12px_28px_rgba(46,44,44,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] border border-[rgba(46,44,44,0.1)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(231,147,30,0.12)_180deg,transparent_360deg)]" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#fefdf9] shadow-[inset_0_2px_8px_rgba(46,44,44,0.08)] border border-[rgba(231,147,30,0.2)] flex items-center justify-center">
                <motion.div
                  className="absolute top-2.5 w-1.5 h-5 bg-[#e7931e] rounded-full"
                  style={{ boxShadow: indicatorGlow }}
                />
                <span className="mt-5 font-mono text-[9px] text-[#5c5850] tracking-[0.2em]">
                  {label}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <span className="text-[10px] text-[#5c5850] font-mono tracking-[0.2em] mb-1">
            OUTPUT
          </span>
          <DisplayValue value={displayValue} />
        </div>
      </div>
    </div>
  );
}

function TickMark({
  currentRotation,
  angle,
}: {
  currentRotation: MotionValue<number>;
  angle: number;
}) {
  const opacity = useTransform(currentRotation, (r: number) => (r >= angle ? 1 : 0.25));
  const color = useTransform(currentRotation, (r: number) =>
    r >= angle ? "#e7931e" : "#d4c9a8"
  );
  const boxShadow = useTransform(currentRotation, (r: number) =>
    r >= angle ? "0 0 8px rgba(231, 147, 30, 0.55)" : "none"
  );

  return (
    <motion.div
      style={{ backgroundColor: color, opacity, boxShadow }}
      className="w-1 h-2.5 rounded-full"
    />
  );
}

function DisplayValue({ value }: { value: MotionValue<number> }) {
  const [display, setDisplay] = useState(37);
  useMotionValueEvent(value, "change", (latest) => setDisplay(Math.round(latest)));

  return (
    <div className="relative">
      <span className="absolute inset-0 blur-sm text-[#e7931e]/50 font-mono text-3xl font-black tabular-nums tracking-widest">
        {display.toString().padStart(3, "0")}
      </span>
      <span className="relative font-mono text-3xl text-[#c67a12] font-black tabular-nums tracking-widest">
        {display.toString().padStart(3, "0")}
        <span className="text-sm text-[#5c5850] ml-1">%</span>
      </span>
    </div>
  );
}
