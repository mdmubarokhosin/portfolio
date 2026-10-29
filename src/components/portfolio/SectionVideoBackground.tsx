"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* prefers-reduced-motion subscription (SSR-safe) */
const reducedMotionStore = {
  subscribe(onChange: () => void) {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  },
  getSnapshot() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
  getServerSnapshot() {
    return false;
  },
};

/**
 * Ambient looping video behind a section.
 *
 * The Remotion renders have a pure-white base with cyan/teal artwork, so:
 *  • light theme → `mix-blend-multiply` makes the base vanish and the
 *    artwork tint the light page background
 *  • dark theme  → invert+hue-rotate turns the base black and `screen`
 *    makes it vanish while the cyan artwork glows
 *
 * Plays only while visible (IntersectionObserver) and falls back to the
 * poster frame for reduced-motion users or broken sources.
 */
export default function SectionVideoBackground({
  src,
  poster,
  className = "",
  opacityClass = "opacity-80 dark:opacity-60",
  blendClass = "mix-blend-multiply dark:invert dark:hue-rotate-180 dark:mix-blend-screen",
  eager = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  opacityClass?: string;
  blendClass?: string;
  /** Above-the-fold sections should buffer the full video immediately */
  eager?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const reduced = useSyncExternalStore(
    reducedMotionStore.subscribe,
    reducedMotionStore.getSnapshot,
    reducedMotionStore.getServerSnapshot
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || failed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced, failed]);

  if (failed || reduced) {
    if (!poster) return null;
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 select-none ${className}`}
      >
        <img
          src={poster}
          alt=""
          className={`h-full w-full object-cover ${blendClass} ${opacityClass}`}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        {...(eager ? { fetchPriority: "high" as const } : {})}
        disablePictureInPicture
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${blendClass} ${opacityClass}`}
      />
    </div>
  );
}
