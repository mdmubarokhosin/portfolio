import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getCover, type CoverEntry } from "../data/projects";
import {
  Bars,
  BrowserFrame,
  Chip,
  DarkStage,
  Donut,
  PhoneFrame,
  SkeletonLines,
  Waveform,
  hexAlpha,
  withFonts,
} from "../kit";
import { BRAND, LogoMark } from "../Logo";

/* ------------------------------------------------------------------ */
/* CoverShowcase — 960×540 · 30fps · 8s                                */
/* সাইটের পুরনো কভার ভিডিওগুলোর (ecommerce, mobileapp, dashboard,       */
/* devblog, portfolio-site) এডিটেবল Remotion পুনর্নির্মাণ               */
/* ------------------------------------------------------------------ */

const EN_NAME = "MD MUBAROK HOSIN";
const BN_NAME = "মোঃ মোবারক হুসেন";

const ShopScene: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cart = Math.min(3, Math.max(0, Math.floor((frame - 100) / 30) + 1));
  const pulse = 1 + Math.sin(frame / 11) * 0.05;
  return (
    <div style={{ position: "absolute", right: 60, top: 66 }}>
      <BrowserFrame url="shop.example.com" accent={accent} width={452} height={330} delay={10}>
        {/* nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderBottom: "1px solid rgba(148,163,184,0.15)",
          }}
        >
          <span style={{ width: 18, height: 18, borderRadius: 6, background: hexAlpha(accent, 0.9) }} />
          <SkeletonLines widths={[54, 40, 46]} accent="rgba(226,232,240,0.55)" delay={26} gap={0} />
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <span style={{ fontSize: 15, color: "rgba(226,232,240,0.85)" }}>🛒</span>
            <span
              style={{
                position: "absolute",
                top: -7,
                right: -9,
                minWidth: 15,
                height: 15,
                borderRadius: 8,
                background: accent,
                color: "#0b1220",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: '"Space Grotesk", sans-serif',
              }}
            >
              {cart}
            </span>
          </div>
        </div>
        {/* product grid */}
        <div style={{ display: "flex", gap: 11, padding: "13px 14px" }}>
          {[0, 1, 2].map((i) => {
            const s = spring({ frame: frame - 34 - i * 9, fps, config: { damping: 14 } });
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 11,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  overflow: "hidden",
                  opacity: Math.min(s * 1.5, 1),
                  transform: `translateY(${(1 - s) * 24}px)`,
                }}
              >
                <div
                  style={{
                    height: 74,
                    background: `linear-gradient(135deg, ${hexAlpha(accent, 0.42)}, ${hexAlpha(
                      BRAND.teal,
                      0.2
                    )})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  {["🎧", "⌚", "👟"][i]}
                </div>
                <div style={{ padding: "8px 9px" }}>
                  <div style={{ width: "82%", height: 7, borderRadius: 4, background: "rgba(226,232,240,0.6)" }} />
                  <div style={{ height: 6 }} />
                  <div style={{ width: "55%", height: 7, borderRadius: 4, background: hexAlpha(accent, 0.85) }} />
                  <div style={{ height: 7 }} />
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0, 1, 2, 3, 4].map((s2) => (
                      <span key={s2} style={{ fontSize: 8, color: "#fbbf24" }}>
                        ★
                      </span>
                    ))}
                  </div>
                  {i === 1 ? (
                    <div
                      style={{
                        marginTop: 7,
                        textAlign: "center",
                        padding: "5px 0",
                        borderRadius: 8,
                        background: accent,
                        color: "#06202a",
                        fontSize: 10.5,
                        fontWeight: 700,
                        fontFamily: '"Space Grotesk", sans-serif',
                        transform: `scale(${pulse})`,
                      }}
                    >
                      Add to Cart
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </BrowserFrame>
    </div>
  );
};

const MobileScene: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [92, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", right: 96, top: 62 }}>
      <PhoneFrame accent={accent} width={220} height={344} delay={10}>
        <div style={{ display: "flex", gap: 8, height: "100%", paddingTop: 14 }}>
          {[0, 1].map((col) => (
            <div
              key={col}
              style={{
                flex: 1,
                borderRadius: 11,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(148,163,184,0.16)",
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: col === 0 ? accent : BRAND.cyanLight,
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: 10.5,
                    color: "rgba(226,232,240,0.8)",
                    fontWeight: 600,
                  }}
                >
                  {col === 0 ? "To Do" : "Done"}
                </span>
              </div>
              {col === 0 ? (
                <>
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 9,
                        padding: "8px 9px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(148,163,184,0.18)",
                      }}
                    >
                      <div style={{ width: "85%", height: 7, borderRadius: 4, background: "rgba(226,232,240,0.6)" }} />
                      <div style={{ height: 5 }} />
                      <div style={{ width: "52%", height: 7, borderRadius: 4, background: hexAlpha(accent, 0.8) }} />
                    </div>
                  ))}
                  {/* moving card */}
                  <div
                    style={{
                      borderRadius: 9,
                      padding: "8px 9px",
                      background: hexAlpha(accent, 0.22),
                      border: `1px solid ${hexAlpha(accent, 0.55)}`,
                      transform: `translate(${move * 96}px, ${move * 96}px) rotate(${move * 6}deg)`,
                      opacity: 1 - move * 0.15,
                      boxShadow: move > 0 ? `0 10px 24px ${hexAlpha(accent, 0.4)}` : "none",
                    }}
                  >
                    <div style={{ width: "88%", height: 7, borderRadius: 4, background: "rgba(226,232,240,0.85)" }} />
                    <div style={{ height: 5 }} />
                    <div style={{ width: "48%", height: 7, borderRadius: 4, background: hexAlpha(accent, 0.9) }} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ height: 90 * move }} />
                  <div
                    style={{
                      borderRadius: 9,
                      padding: "8px 9px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(148,163,184,0.18)",
                    }}
                  >
                    <div style={{ width: "70%", height: 7, borderRadius: 4, background: hexAlpha(BRAND.teal, 0.9) }} />
                    <div style={{ height: 5 }} />
                    <div style={{ width: "40%", height: 7, borderRadius: 4, background: "rgba(148,163,184,0.3)" }} />
                  </div>
                  <div
                    style={{
                      borderRadius: 9,
                      padding: "8px 9px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(148,163,184,0.18)",
                    }}
                  >
                    <div style={{ width: "60%", height: 7, borderRadius: 4, background: "rgba(226,232,240,0.55)" }} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </PhoneFrame>
    </div>
  );
};

const DashboardScene: React.FC<{ accent: string }> = ({ accent }) => (
  <AbsoluteFill style={{ padding: "54px 56px 0" }}>
    <div style={{ display: "flex", gap: 14 }}>
      {/* main chart card */}
      <div
        style={{
          width: 380,
          borderRadius: 16,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(148,163,184,0.22)",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ position: "absolute" }} />
        <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ width: 120, height: 9, borderRadius: 5, background: "rgba(226,232,240,0.8)" }} />
          <div style={{ width: 80, height: 9, borderRadius: 5, background: "rgba(148,163,184,0.3)" }} />
        </div>
        <Bars values={[30, 66, 47, 85, 44, 62, 72]} accent={accent} delay={40} height={128} />
      </div>
      {/* stat column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Revenue", value: "+128%", color: "#34d399" },
          { label: "Active Users", value: "4.0K", color: BRAND.cyanLight },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              width: 210,
              borderRadius: 13,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(148,163,184,0.22)",
              padding: "11px 14px",
              marginLeft: i * 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
              <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 11.5, color: "rgba(203,213,225,0.75)" }}>
                {s.label}
              </span>
            </div>
            <div
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 700,
                fontSize: 22,
                color: "#f8fafc",
                marginTop: 3,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
        <div
          style={{
            width: 228,
            borderRadius: 13,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(148,163,184,0.22)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Donut percent={76} accent={BRAND.teal} size={72} delay={90} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["Organic", "Direct", "Social"].map((l, i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    background: [BRAND.teal, BRAND.cyanLight, "#a78bfa"][i],
                  }}
                />
                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 10.5, color: "rgba(203,213,225,0.8)" }}>
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

const BlogScene: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const cursor = Math.sin(frame / 8) > 0 ? 1 : 0.15;
  return (
    <div style={{ position: "absolute", right: 60, top: 66 }}>
      <BrowserFrame url="devblog.example.com" accent={accent} width={452} height={330} delay={10}>
        <div style={{ display: "flex", height: "100%" }}>
          {/* tags sidebar */}
          <div style={{ width: 96, borderRight: "1px solid rgba(148,163,184,0.15)", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
            {["MDX", "React", "TypeScript", "Next.js", "CSS"].map((t, i) => (
              <span
                key={t}
                style={{
                  alignSelf: "flex-start",
                  padding: "3px 9px",
                  borderRadius: 7,
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: i === 0 ? "#0b1220" : "rgba(226,232,240,0.85)",
                  background: i === 0 ? accent : "rgba(148,163,184,0.14)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          {/* posts */}
          <div style={{ flex: 1, padding: "13px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 150, height: 10, borderRadius: 5, background: hexAlpha(accent, 0.85) }} />
              <span style={{ color: accent, fontFamily: '"Space Grotesk", monospace', fontSize: 13, opacity: cursor }}>▌</span>
            </div>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: 10,
                  borderRadius: 11,
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(148,163,184,0.16)",
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 9,
                    background: `linear-gradient(135deg, ${hexAlpha(accent, 0.5)}, ${hexAlpha(BRAND.teal, 0.25)})`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
                  <div style={{ width: 170, height: 8, borderRadius: 4, background: "rgba(226,232,240,0.65)" }} />
                  <div style={{ width: 120, height: 7, borderRadius: 4, background: "rgba(148,163,184,0.28)" }} />
                  <div style={{ width: 88, height: 7, borderRadius: 4, background: hexAlpha(accent, 0.6) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </BrowserFrame>
    </div>
  );
};

const SiteScene: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const markS = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 110 } });
  const draw = interpolate(frame, [16, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nodes = interpolate(frame, [44, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const letters = EN_NAME.split("").map((ch, i) => {
    const st = 40 + i * 1.6;
    const o = interpolate(frame, [st, st + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [st, st + 16], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: o, transform: `translateY(${y}px)` }}>
        {ch === " " ? "\u00A0" : ch}
      </span>
    );
  });
  const bnIn = interpolate(frame, [64, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const btnIn = interpolate(frame, [92, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${markS})` }}>
          <LogoMark size={110} idPrefix="site" drawProgress={draw} nodesIn={nodes} />
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "0.05em",
            color: "#f8fafc",
          }}
        >
          {letters}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: '"SolaimanLipi", sans-serif',
            fontSize: 22,
            color: BRAND.cyanLight,
            opacity: bnIn,
            textShadow: "0 0 20px rgba(6,182,212,0.4)",
          }}
        >
          {BN_NAME}
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 12, opacity: btnIn }}>
          <span
            style={{
              padding: "8px 22px",
              borderRadius: 999,
              background: `linear-gradient(135deg, ${BRAND.cyanLight}, ${BRAND.teal})`,
              color: "#04202b",
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            View My Work
          </span>
          <span
            style={{
              padding: "8px 22px",
              borderRadius: 999,
              border: "1.5px solid rgba(148,163,184,0.5)",
              color: "rgba(226,232,240,0.9)",
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Let&apos;s Talk
          </span>
        </div>
        <div style={{ marginTop: 20 }}>
          <Chip label="Next.js · TypeScript · Remotion" color={accent} delay={116} small />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CoverTitle: React.FC<{ cover: CoverEntry }> = ({ cover }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [14, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [14, 34], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 56, bottom: 40, opacity: o, transform: `translateY(${y}px)` }}>
      <div
        style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          fontSize: 27,
          color: "#f8fafc",
          textShadow: "0 4px 20px rgba(2,6,23,0.55)",
        }}
      >
        {cover.title}
      </div>
      <div
        style={{
          marginTop: 5,
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: 13,
          letterSpacing: "0.08em",
          color: hexAlpha(cover.accent, 0.95),
        }}
      >
        {cover.subtitle.toUpperCase()}
      </div>
    </div>
  );
};

const CoverShowcaseBase: React.FC<{ slug: string }> = ({ slug }) => {
  const cover = getCover(slug);
  const frame = useCurrentFrame();
  const particles = new Array(14).fill(0).map((_, i) => ({
    x: random(`cp${i}`) * 100,
    size: 2 + random(`cs${i}`) * 3,
    speed: 0.4 + random(`cv${i}`) * 0.9,
    off: random(`co${i}`) * 900,
  }));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <DarkStage accent={cover.accent} />
      <AbsoluteFill>
        {particles.map((p, i) => {
          const y = 570 - ((p.off + frame * p.speed) % 620);
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: y,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: i % 3 === 0 ? BRAND.cyanLight : BRAND.cyan,
                opacity: 0.4,
                boxShadow: `0 0 ${p.size * 3}px rgba(6,182,212,0.5)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      {cover.kind === "shop" ? <ShopScene accent={cover.accent} /> : null}
      {cover.kind === "mobile" ? <MobileScene accent={cover.accent} /> : null}
      {cover.kind === "dashboard" ? <DashboardScene accent={cover.accent} /> : null}
      {cover.kind === "blog" ? <BlogScene accent={cover.accent} /> : null}
      {cover.kind === "site" ? <SiteScene accent={cover.accent} /> : null}
      {cover.kind !== "site" ? (
        <div style={{ position: "absolute", left: 56, bottom: 118, display: "flex", gap: 8 }}>
          <Chip label="Live Demo" color={cover.accent} delay={70} small />
          <Chip label="Source Code" color={BRAND.cyanLight} delay={82} small />
        </div>
      ) : null}
      <CoverTitle cover={cover} />
      <div style={{ position: "absolute", right: 56, bottom: 40, opacity: 0.85 }}>
        <Waveform accent={cover.accent} delay={20} count={16} />
      </div>
    </AbsoluteFill>
  );
};

export const CoverShowcase = withFonts(CoverShowcaseBase);
