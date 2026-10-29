"use client";

import { useEffect, useRef, useState } from "react";

/**
 * VideoCover — replaces static cover images with looping videos.
 * - Autoplay muted loop (no audio track, so autoplay is allowed everywhere)
 * - Plays ONLY while visible in viewport (IntersectionObserver) → saves CPU/battery
 * - Respects prefers-reduced-motion → shows poster instead
 * - Falls back to the poster image if the video fails to load
 */
export default function VideoCover({
  src,
  poster,
  alt,
  className = "",
  zoomOnHover = false,
}: {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
  zoomOnHover?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [allowMotion, setAllowMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowMotion(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !allowMotion) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              /* autoplay refusal — poster already visible */
            });
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [allowMotion]);

  if (failed || !allowMotion) {
    if (poster) {
      return (
        <img
          src={poster}
          alt={alt}
          loading="lazy"
          className={`${className} ${zoomOnHover ? "transition-transform duration-500 group-hover:scale-105" : ""}`}
        />
      );
    }
    /* No poster available (e.g. an external video link failed) — render a
       neutral gradient block instead of a broken-image icon. */
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} bg-gradient-to-br from-muted via-secondary to-muted ${
          zoomOnHover ? "transition-transform duration-500 group-hover:scale-105" : ""
        }`}
      />
    );
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={`${className} ${zoomOnHover ? "transition-transform duration-500 group-hover:scale-105" : ""}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      aria-label={alt}
      role="img"
    />
  );
}
