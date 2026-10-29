import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, FontsStyle, useWaitFonts } from "./Logo";

/* Shared design kit — matches the site's video design language.
   সব কম্পোজিশন এই কিট ব্যবহার করে (রঙ/ফন্ট এক জায়গা থেকে বদলানো যায়) */

export { BRAND, FontsStyle, useWaitFonts };

export const withFonts = <P extends object>(Comp: React.ComponentType<P>) => {
  const Wrapped: React.FC<P> = (props) => {
    useWaitFonts();
    return (
      <>
        <FontsStyle />
        <Comp {...props} />
      </>
    );
  };
  return Wrapped;
};

/* ---------------------------------- stage backgrounds -------------- */

export const DarkStage: React.FC<{ accent?: string; glow?: number }> = ({
  accent = BRAND.cyan,
  glow = 0.16,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.slate, overflow: "hidden" }}>
      {/* drifting accent orbs */}
      <div
        style={{
          position: "absolute",
          left: `${50 + Math.sin(frame / 150) * 14}%`,
          top: `${46 + Math.cos(frame / 190) * 12}%`,
          width: 900,
          height: 900,
          marginLeft: -450,
          marginTop: -450,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}${Math.round(
            glow * 255
          )
            .toString(16)
            .padStart(2, "0")} 0%, transparent 66%)`,
          filter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${22 + Math.cos(frame / 170) * 10}%`,
          top: `${70 + Math.sin(frame / 210) * 8}%`,
          width: 560,
          height: 560,
          marginLeft: -280,
          marginTop: -280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 66%)",
          filter: "blur(6px)",
        }}
      />
      {/* grid */}
      <AbsoluteFill
        style={{
          opacity: 0.5,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(2,6,23,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------------------------- atoms -------------------------- */

export const Chip: React.FC<{
  label: string;
  color?: string;
  delay?: number;
  small?: boolean;
}> = ({ label, color = BRAND.cyan, delay = 0, small }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 130 } });
  if (s <= 0) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: small ? "4px 11px" : "6px 14px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(148,163,184,0.28)",
        fontFamily: '"Space Grotesk", "SolaimanLipi", sans-serif',
        fontSize: small ? 12 : 14,
        fontWeight: 600,
        color: "rgba(226,232,240,0.92)",
        transform: `scale(${s})`,
        opacity: Math.min(s * 1.4, 1),
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {label}
    </div>
  );
};

/** বাংলা ফিচার লাইন — গ্লাস কার্ড স্টাইল */
export const FeatureLine: React.FC<{
  text: string;
  accent: string;
  delay: number;
  width?: number;
}> = ({ text, accent, delay, width = 388 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120 } });
  if (s <= 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width,
        padding: "8px 15px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(148,163,184,0.22)",
        transform: `translateX(${(1 - s) * -34}px)`,
        opacity: Math.min(s * 1.5, 1),
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: 7,
          backgroundColor: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#fff",
          fontWeight: 700,
          fontFamily: '"Space Grotesk", sans-serif',
          boxShadow: `0 0 12px ${accent}66`,
        }}
      >
        ✓
      </span>
      <span
        style={{
          fontFamily: '"SolaimanLipi", sans-serif',
          fontSize: 16.5,
          color: "rgba(241,245,249,0.94)",
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** প্রজেক্ট মনোগ্রাম ব্যাজ — অ্যাকসেন্ট গ্রেডিয়েন্ট + ইনিশিয়াল */
export const Monogram: React.FC<{
  letter: string;
  accent: string;
  size?: number;
  delay?: number;
}> = ({ letter, accent, size = 64, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 120, mass: 0.8 } });
  if (s <= 0) return null;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${accent} 0%, ${shade(accent, -28)} 100%)`,
        border: "1.5px solid rgba(255,255,255,0.35)",
        boxShadow: `0 10px 30px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`,
      }}
    >
      <span
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: size * 0.5,
          color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        {letter}
      </span>
    </div>
  );
};

/* ---------------------------------- mockup frames ------------------ */

export const BrowserFrame: React.FC<{
  url: string;
  accent: string;
  width: number;
  height: number;
  delay?: number;
  children: React.ReactNode;
}> = ({ url, accent, width, height, delay = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 100 } });
  if (s <= 0) return null;
  return (
    <div
      style={{
        width,
        transform: `translateY(${(1 - s) * 60}px)`,
        opacity: Math.min(s * 1.6, 1),
      }}
    >
      {/* chrome bar */}
      <div
        style={{
          height: 34,
          borderRadius: "12px 12px 0 0",
          background: "rgba(15,23,42,0.92)",
          border: "1px solid rgba(148,163,184,0.25)",
          borderBottom: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
        }}
      >
        {["#f87171", "#fbbf24", "#34d399"].map((c) => (
          <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: c, opacity: 0.9 }} />
        ))}
        <div
          style={{
            marginLeft: 8,
            flex: 1,
            height: 18,
            borderRadius: 9,
            background: "rgba(148,163,184,0.12)",
            border: `1px solid ${accent}44`,
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
            fontFamily: '"Space Grotesk", monospace',
            fontSize: 11,
            color: "rgba(226,232,240,0.75)",
          }}
        >
          {url}
        </div>
      </div>
      {/* content */}
      <div
        style={{
          height: height - 34,
          borderRadius: "0 0 12px 12px",
          background: "rgba(15,23,42,0.72)",
          border: "1px solid rgba(148,163,184,0.25)",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(2,6,23,0.55)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const PhoneFrame: React.FC<{
  accent: string;
  width: number;
  height: number;
  delay?: number;
  children: React.ReactNode;
}> = ({ accent, width, height, delay = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 100 } });
  const floatY = Math.sin(frame / 34) * 5;
  if (s <= 0) return null;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 26,
        background: "rgba(15,23,42,0.94)",
        border: "1.5px solid rgba(148,163,184,0.35)",
        borderTop: `3px solid ${accent}`,
        boxShadow: `0 26px 60px rgba(2,6,23,0.6), 0 0 40px ${accent}22`,
        overflow: "hidden",
        position: "relative",
        transform: `translateY(${(1 - s) * 60 + floatY}px)`,
        opacity: Math.min(s * 1.6, 1),
        padding: 12,
      }}
    >
      {/* notch */}
      <div
        style={{
          position: "absolute",
          top: 7,
          left: "50%",
          transform: "translateX(-50%)",
          width: 64,
          height: 7,
          borderRadius: 4,
          background: "rgba(148,163,184,0.35)",
        }}
      />
      {children}
    </div>
  );
};

/* ---------------------------------- skeleton bits ------------------ */

export const Bars: React.FC<{
  values: number[];
  accent: string;
  delay?: number;
  height?: number;
}> = ({ values, accent, delay = 0, height = 96 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, width: "100%", overflow: "hidden" }}>
      {values.map((v, i) => {
        const s = spring({ frame: frame - delay - i * 4, fps, config: { damping: 14 } });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: Math.max(2, v * height * s),
              borderRadius: "5px 5px 2px 2px",
              background: `linear-gradient(180deg, ${accent}, ${shade(accent, -35)})`,
              opacity: 0.92,
            }}
          />
        );
      })}
    </div>
  );
};

export const Donut: React.FC<{
  percent: number;
  accent: string;
  size?: number;
  delay?: number;
  label?: string;
}> = ({ percent, accent, size = 86, delay = 0, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 70 } });
  const p = Math.min(Math.max(percent * s, 0), 100);
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * p) / 100}
          style={{ filter: `drop-shadow(0 0 6px ${accent}88)` }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: size * 0.24,
          color: "#f8fafc",
        }}
      >
        {label ?? `${Math.round(p)}%`}
      </div>
    </div>
  );
};

export const SkeletonLines: React.FC<{
  widths: number[];
  accent?: string;
  delay?: number;
  gap?: number;
}> = ({ widths, accent = "rgba(148,163,184,0.4)", delay = 0, gap = 9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {widths.map((w, i) => {
        const s = spring({ frame: frame - delay - i * 3, fps, config: { damping: 16 } });
        return (
          <div
            key={i}
            style={{
              width: w * s,
              height: 8,
              borderRadius: 4,
              background: i === 0 ? accent : "rgba(148,163,184,0.25)",
            }}
          />
        );
      })}
    </div>
  );
};

export const Waveform: React.FC<{ accent: string; delay?: number; count?: number }> = ({
  accent,
  delay = 0,
  count = 22,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40 }}>
      {new Array(count).fill(0).map((_, i) => {
        const h = 8 + Math.abs(Math.sin(frame / 7 + i * 0.9)) * 30;
        const o = interpolate(frame, [delay, delay + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              width: 3.5,
              height: h * o,
              borderRadius: 2,
              backgroundColor: i % 4 === 0 ? BRAND.cyanLight : accent,
              opacity: 0.85,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------------------------------- helpers ------------------------ */

/** hex কালার হালকা/গাঢ় করা (amount −100..100) */
export const shade = (hex: string, amount: number): string => {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export const hexAlpha = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  const r = num >> 16;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
};

/** ভাসমান কোড-চিহ্ন (লাইট/ডার্ক দুই থিমেই) */
export const CodeGlyphs: React.FC<{
  dark?: boolean;
  count?: number;
  seed?: string;
}> = ({ dark = true, count = 10, seed = "g" }) => {
  const frame = useCurrentFrame();
  const glyphs = ["{ }", "</>", "#", "=>", "01", "( )", "&&", "fn"];
  const items = new Array(count).fill(0).map((_, i) => ({
    text: glyphs[Math.floor(random(`${seed}t${i}`) * glyphs.length)],
    x: random(`${seed}x${i}`) * 100,
    drift: 8 + random(`${seed}d${i}`) * 14,
    period: 240 + random(`${seed}p${i}`) * 160,
    off: random(`${seed}o${i}`) * 400,
    size: 13 + random(`${seed}s${i}`) * 12,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {items.map((g, i) => {
        const y = 110 - (((frame + g.off) / g.period) % 1) * 130;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${g.x + Math.sin(frame / 90 + i) * 2}%`,
              top: `${y}%`,
              fontFamily: '"Space Grotesk", monospace',
              fontSize: g.size,
              color: dark ? "rgba(34,211,238,0.20)" : "rgba(8,145,178,0.16)",
              fontWeight: 600,
            }}
          >
            {g.text}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};

/** নিচের ব্র্যান্ড ফুটার */
export const FooterBar: React.FC<{ right?: string; delay?: number }> = ({
  right,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: o,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 13,
          letterSpacing: "0.14em",
          color: "rgba(148,163,184,0.85)",
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: `linear-gradient(135deg, ${BRAND.cyanLight}, ${BRAND.teal})`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          M
        </span>
        MD MUBAROK HOSIN · PORTFOLIO
      </div>
      {right ? (
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 13,
            color: BRAND.cyanLight,
            fontWeight: 600,
          }}
        >
          {right}
        </div>
      ) : null}
    </div>
  );
};

export const easeOut = Easing.out(Easing.cubic);
