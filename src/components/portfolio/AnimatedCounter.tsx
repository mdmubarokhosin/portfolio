"use client";

import { useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { localizeDigits, pickSuffix } from "@/lib/i18n-utils";

interface AnimatedCounterProps {
  value: number;
  /** English suffix, e.g. "+", "%", " Years" */
  suffix?: string;
  /** Bengali suffix — wins over `suffix` when the site is in Bangla */
  suffixBn?: string | null;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  suffixBn,
  duration = 1800,
  className,
}: AnimatedCounterProps) {
  const { isBn } = useLanguage();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {localizeDigits(display, isBn)}
      {pickSuffix(isBn, suffix, suffixBn)}
    </span>
  );
}
