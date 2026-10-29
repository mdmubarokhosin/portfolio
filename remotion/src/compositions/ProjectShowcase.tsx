import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getProject } from "../data/projects";
import {
  Bars,
  BrowserFrame,
  Chip,
  DarkStage,
  Donut,
  FeatureLine,
  FooterBar,
  Monogram,
  PhoneFrame,
  SkeletonLines,
  hexAlpha,
  shade,
  withFonts,
} from "../kit";
import { BRAND } from "../Logo";

/* ------------------------------------------------------------------ */
/* ProjectShowcase — 960×540 · 30fps · 8s (240f)                       */
/* সাইটের Projects সেকশনের জন্য শোকেস ভিডিও (props: slug)               */
/* ------------------------------------------------------------------ */

const WebMock: React.FC<{ accent: string; url: string }> = ({ accent, url }) => (
  <BrowserFrame url={url} accent={accent} width={424} height={330} delay={64}>
    <div style={{ display: "flex", height: "100%" }}>
      {/* sidebar */}
      <div
        style={{
          width: 52,
          borderRight: "1px solid rgba(148,163,184,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          paddingTop: 16,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: i === 0 ? hexAlpha(accent, 0.85) : "rgba(148,163,184,0.16)",
            }}
          />
        ))}
      </div>
      {/* main */}
      <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(148,163,184,0.18)",
            }}
          >
            <SkeletonLines widths={[70, 46]} accent={hexAlpha(accent, 0.8)} delay={96} />
          </div>
          <div
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(148,163,184,0.18)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Donut percent={76} accent={accent} size={56} delay={112} />
            <SkeletonLines widths={[58, 40]} accent={hexAlpha(accent, 0.8)} delay={118} />
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(148,163,184,0.18)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Bars values={[34, 58, 44, 72, 55, 88, 66]} accent={accent} delay={104} height={98} />
        </div>
      </div>
    </div>
  </BrowserFrame>
);

const MobileMock: React.FC<{ accent: string }> = ({ accent }) => (
  <PhoneFrame accent={accent} width={224} height={352} delay={64}>
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10, paddingTop: 12 }}>
      {/* app header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: hexAlpha(accent, 0.9) }} />
        <SkeletonLines widths={[64, 40]} accent={hexAlpha(accent, 0.85)} delay={88} gap={5} />
      </div>
      {/* balance card */}
      <div
        style={{
          borderRadius: 14,
          padding: "12px 14px",
          background: `linear-gradient(135deg, ${hexAlpha(accent, 0.32)}, ${hexAlpha(accent, 0.10)})`,
          border: `1px solid ${hexAlpha(accent, 0.45)}`,
          overflow: "hidden",
        }}
      >
        <SkeletonLines widths={[54]} accent="rgba(226,232,240,0.75)" delay={96} gap={6} />
        <div style={{ height: 8 }} />
        <Bars values={[30, 55, 42, 78, 60, 92]} accent={accent} delay={104} height={40} />
      </div>
      {/* list rows */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 10px",
            borderRadius: 11,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(148,163,184,0.16)",
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 7,
              background: i % 2 === 0 ? hexAlpha(accent, 0.75) : "rgba(148,163,184,0.22)",
            }}
          />
          <SkeletonLines widths={[76, 48]} accent="rgba(226,232,240,0.6)" delay={112 + i * 8} gap={5} />
        </div>
      ))}
      {/* FAB */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 8px 22px ${hexAlpha(accent, 0.55)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 19,
          fontWeight: 700,
          fontFamily: '"Space Grotesk", sans-serif',
        }}
      >
        +
      </div>
    </div>
  </PhoneFrame>
);

const ProjectShowcaseBase: React.FC<{ slug: string }> = ({ slug }) => {
  const p = getProject(slug);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleIn = interpolate(frame, [16, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [16, 40], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bnIn = interpolate(frame, [26, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bnY = interpolate(frame, [26, 50], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagIn = interpolate(frame, [36, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ken = 1 + (frame / durationInFrames) * 0.022;

  const springy = (at: number) =>
    Math.max(
      0,
      1 - Math.pow(1 - Math.min(Math.max((frame - at) / 16, 0), 1), 3)
    );
  void fps;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <DarkStage accent={p.accent} />
      <AbsoluteFill style={{ transform: `scale(${ken})` }}>
        {/* header row */}
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 36,
            right: 56,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Monogram letter={p.nameEn.charAt(0)} accent={p.accent} size={58} delay={4} />
          <div style={{ opacity: springy(14) }}>
            <Chip label={p.category} color={p.accent} delay={14} small />
          </div>
          {p.url ? (
            <div style={{ marginLeft: "auto", opacity: springy(24) }}>
              <Chip label={p.url} color={BRAND.cyanLight} delay={24} small />
            </div>
          ) : null}
        </div>

        {/* left column */}
        <div style={{ position: "absolute", left: 56, top: 122, width: 396 }}>
          <div
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: p.nameEn.length > 24 ? 31 : 35,
              lineHeight: 1.16,
              color: "#f8fafc",
              opacity: titleIn,
              transform: `translateY(${titleY}px)`,
              textShadow: "0 4px 22px rgba(2,6,23,0.5)",
            }}
          >
            {p.nameEn}
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: '"SolaimanLipi", sans-serif',
              fontSize: 22,
              lineHeight: 1.4,
              color: shade(p.accent, 70),
              opacity: bnIn,
              transform: `translateY(${bnY}px)`,
              textShadow: `0 0 20px ${hexAlpha(p.accent, 0.35)}`,
            }}
          >
            {p.nameBn}
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: '"Inter", "Space Grotesk", sans-serif',
              fontSize: 13.5,
              lineHeight: 1.45,
              color: "rgba(203,213,225,0.8)",
              opacity: tagIn,
              transform: `translateY(${(1 - tagIn) * 14}px)`,
            }}
          >
            {p.taglineEn}
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {p.features.map((f, i) => (
              <FeatureLine key={i} text={f} accent={p.accent} delay={54 + i * 13} width={388} />
            ))}
          </div>
        </div>

        {/* right mockup */}
        <div style={{ position: "absolute", right: 52, top: 112 }}>
          {p.kind === "web" ? (
            <WebMock accent={p.accent} url={p.url ?? p.nameEn.toLowerCase().replace(/\s+/g, "") + ".app"} />
          ) : (
            <MobileMock accent={p.accent} />
          )}
        </div>

        {/* tech chips */}
        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 56,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {p.tech.slice(0, 5).map((t, i) => (
            <Chip key={i} label={t} color={i % 2 === 0 ? p.accent : BRAND.cyanLight} delay={126 + i * 7} small />
          ))}
        </div>

        <FooterBar right={p.url ? undefined : p.category} delay={168} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ProjectShowcase = withFonts(ProjectShowcaseBase);
