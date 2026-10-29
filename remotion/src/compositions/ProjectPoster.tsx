import React from "react";
import { AbsoluteFill } from "remotion";
import { getProject } from "../data/projects";
import {
  Bars,
  BrowserFrame,
  DarkStage,
  Donut,
  hexAlpha,
  shade,
  withFonts,
} from "../kit";
import { BRAND } from "../Logo";

/* ------------------------------------------------------------------ */
/* ProjectPoster — 960×540 স্ট্যাটিক পোস্টার (props: slug)               */
/* রেন্ডার: remotion still ProjectPoster <slug>-poster.jpg --props=...  */
/* ------------------------------------------------------------------ */

const PosterMock: React.FC<{ accent: string; url: string; kind: "web" | "mobile" }> = ({
  accent,
  url,
  kind,
}) =>
  kind === "web" ? (
    <BrowserFrame url={url} accent={accent} width={400} height={318} delay={-999}>
      <div style={{ display: "flex", height: "100%" }}>
        <div
          style={{
            width: 48,
            borderRight: "1px solid rgba(148,163,184,0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 13,
            paddingTop: 15,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              style={{
                width: 20,
                height: 20,
                borderRadius: 7,
                background: i === 0 ? hexAlpha(accent, 0.85) : "rgba(148,163,184,0.16)",
              }}
            />
          ))}
        </div>
        <div style={{ flex: 1, padding: "13px 15px", display: "flex", flexDirection: "column", gap: 11 }}>
          <div style={{ display: "flex", gap: 11 }}>
            <div
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <div style={{ width: 76, height: 8, borderRadius: 4, background: hexAlpha(accent, 0.8) }} />
              <div style={{ height: 7 }} />
              <div style={{ width: 48, height: 8, borderRadius: 4, background: "rgba(148,163,184,0.25)" }} />
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
              <Donut percent={76} accent={accent} size={54} delay={-999} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ width: 58, height: 8, borderRadius: 4, background: hexAlpha(accent, 0.8) }} />
                <div style={{ width: 40, height: 8, borderRadius: 4, background: "rgba(148,163,184,0.25)" }} />
              </div>
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
              alignItems: "flex-end",
            }}
          >
            <Bars values={[34, 58, 44, 72, 55, 88, 66]} accent={accent} delay={-999} height={96} />
          </div>
        </div>
      </div>
    </BrowserFrame>
  ) : (
    <div
      style={{
        width: 216,
        height: 340,
        borderRadius: 26,
        background: "rgba(15,23,42,0.94)",
        border: "1.5px solid rgba(148,163,184,0.35)",
        borderTop: `3px solid ${accent}`,
        boxShadow: `0 26px 60px rgba(2,6,23,0.6), 0 0 40px ${hexAlpha(accent, 0.14)}`,
        overflow: "hidden",
        position: "relative",
        padding: 12,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 7,
          left: "50%",
          transform: "translateX(-50%)",
          width: 62,
          height: 7,
          borderRadius: 4,
          background: "rgba(148,163,184,0.35)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 9, paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px" }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: hexAlpha(accent, 0.9) }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ width: 62, height: 7, borderRadius: 4, background: hexAlpha(accent, 0.85) }} />
            <div style={{ width: 40, height: 7, borderRadius: 4, background: "rgba(148,163,184,0.25)" }} />
          </div>
        </div>
        <div
          style={{
            borderRadius: 14,
            padding: "11px 13px",
            background: `linear-gradient(135deg, ${hexAlpha(accent, 0.32)}, ${hexAlpha(accent, 0.10)})`,
            border: `1px solid ${hexAlpha(accent, 0.45)}`,
            overflow: "hidden",
          }}
        >
          <div style={{ width: 52, height: 7, borderRadius: 4, background: "rgba(226,232,240,0.75)" }} />
          <div style={{ height: 7 }} />
          <Bars values={[30, 55, 42, 78, 60, 92]} accent={accent} delay={-999} height={38} />
        </div>
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
                width: 19,
                height: 19,
                borderRadius: 7,
                background: i % 2 === 0 ? hexAlpha(accent, 0.75) : "rgba(148,163,184,0.22)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ width: 74, height: 7, borderRadius: 4, background: "rgba(226,232,240,0.6)" }} />
              <div style={{ width: 46, height: 7, borderRadius: 4, background: "rgba(148,163,184,0.25)" }} />
            </div>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 8px 22px ${hexAlpha(accent, 0.55)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          +
        </div>
      </div>
    </div>
  );

const StatChip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "4px 12px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.055)",
      border: "1px solid rgba(148,163,184,0.28)",
      fontFamily: '"Space Grotesk", "SolaimanLipi", sans-serif',
      fontSize: 12,
      fontWeight: 600,
      color: "rgba(226,232,240,0.92)",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
    {label}
  </div>
);

const ProjectPosterBase: React.FC<{ slug: string }> = ({ slug }) => {
  const p = getProject(slug);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <DarkStage accent={p.accent} />

      {/* header */}
      <div style={{ position: "absolute", left: 52, top: 34, right: 52, display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 15,
            background: `linear-gradient(135deg, ${p.accent} 0%, ${shade(p.accent, -28)} 100%)`,
            border: "1.5px solid rgba(255,255,255,0.35)",
            boxShadow: `0 10px 30px ${hexAlpha(p.accent, 0.34)}, inset 0 1px 0 rgba(255,255,255,0.25)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color: "#fff",
          }}
        >
          {p.nameEn.charAt(0)}
        </div>
        <StatChip label={p.category} color={p.accent} />
        {p.url ? (
          <div style={{ marginLeft: "auto" }}>
            <StatChip label={p.url} color={BRAND.cyanLight} />
          </div>
        ) : null}
      </div>

      {/* left column */}
      <div style={{ position: "absolute", left: 52, top: 116, width: 430 }}>
        <div
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: p.nameEn.length > 24 ? 31 : 35,
            lineHeight: 1.16,
            color: "#f8fafc",
            textShadow: "0 4px 22px rgba(2,6,23,0.5)",
          }}
        >
          {p.nameEn}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: '"SolaimanLipi", sans-serif',
            fontSize: 21,
            lineHeight: 1.42,
            color: shade(p.accent, 70),
            textShadow: `0 0 20px ${hexAlpha(p.accent, 0.35)}`,
          }}
        >
          {p.nameBn}
        </div>
        <div
          style={{
            marginTop: 9,
            fontFamily: '"Inter", "Space Grotesk", sans-serif',
            fontSize: 13,
            lineHeight: 1.45,
            color: "rgba(203,213,225,0.8)",
          }}
        >
          {p.taglineEn}
        </div>
        <div style={{ marginTop: 13, display: "flex", flexDirection: "column", gap: 8, width: 400 }}>
          {p.features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "7px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(148,163,184,0.22)",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 7,
                  backgroundColor: p.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#fff",
                  fontWeight: 700,
                  fontFamily: '"Space Grotesk", sans-serif',
                  boxShadow: `0 0 12px ${hexAlpha(p.accent, 0.4)}`,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontFamily: '"SolaimanLipi", sans-serif',
                  fontSize: 15.5,
                  color: "rgba(241,245,249,0.94)",
                  lineHeight: 1.4,
                }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* right mockup */}
      <div style={{ position: "absolute", right: 50, top: 118 }}>
        <PosterMock
          accent={p.accent}
          url={p.url ?? p.nameEn.toLowerCase().replace(/\s+/g, "") + ".app"}
          kind={p.kind}
        />
      </div>

      {/* tech chips */}
      <div style={{ position: "absolute", left: 52, right: 52, bottom: 58, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {p.tech.slice(0, 5).map((t, i) => (
          <StatChip key={i} label={t} color={i % 2 === 0 ? p.accent : BRAND.cyanLight} />
        ))}
      </div>

      {/* footer */}
      <div
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          bottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 12,
            letterSpacing: "0.14em",
            color: "rgba(148,163,184,0.85)",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${BRAND.cyanLight}, ${BRAND.teal})`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            M
          </span>
          MD MUBAROK HOSIN · PORTFOLIO
        </div>
        <div
          style={{
            fontFamily: '"SolaimanLipi", sans-serif',
            fontSize: 12.5,
            color: "rgba(148,163,184,0.75)",
          }}
        >
          {p.taglineBn}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProjectPoster = withFonts(ProjectPosterBase);
