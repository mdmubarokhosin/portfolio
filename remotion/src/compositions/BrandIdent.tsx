import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CodeGlyphs, hexAlpha, withFonts } from "../kit";
import { BRAND } from "../Logo";

/* ------------------------------------------------------------------ */
/* BrandIdent — 512×512 · 30fps · 8s — avatar.mp4 এর Remotion সোর্স    */
/* "MMH." মনোগ্রাম + <Mubarok /> কোড স্টাইল আইডেন্ট                     */
/* ------------------------------------------------------------------ */

export const BrandIdentBase: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = new Array(12).fill(0).map((_, i) => ({
    x: random(`bi${i}`) * 100,
    y: random(`bj${i}`) * 100,
    tw: 0.3 + random(`bk${i}`) * 0.5,
    ph: random(`bp${i}`) * 6.28,
  }));
  const inS = interpolate(frame, [8, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const codeIn = interpolate(frame, [30, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringRot = (frame / 240) * 360;
  const pulse = 1 + Math.sin(frame / 26) * 0.018;
  const glowP = 0.5 + Math.sin(frame / 21) * 0.18;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* deep teal-navy radial bg */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #123b4d 0%, #0d2b3d 44%, #0f172a 100%)",
        }}
      />
      <CodeGlyphs dark count={9} seed="bi" />
      {/* ring */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          width: 340,
          height: 340,
          marginLeft: -170,
          marginTop: -170,
          borderRadius: "50%",
          border: "1.5px dashed rgba(34,211,238,0.28)",
          transform: `rotate(${ringRot}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(6,182,212,${0.22 * glowP}) 0%, transparent 62%)`,
        }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: i % 2 ? BRAND.cyanLight : BRAND.teal,
            opacity: p.tw * (0.6 + 0.4 * Math.sin(frame / 16 + p.ph)),
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${pulse})`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: inS }}>
          <div
            style={{
              position: "relative",
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: 96,
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              background: `linear-gradient(100deg, #e8fbff 0%, ${BRAND.cyanLight} 38%, ${BRAND.teal} 78%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "none",
              filter: `drop-shadow(0 0 26px ${hexAlpha(BRAND.cyan, 0.45)})`,
            }}
          >
            MMH<span style={{ color: BRAND.teal, WebkitTextFillColor: BRAND.teal }}>.</span>
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: '"Space Grotesk", monospace',
              fontSize: 23,
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: BRAND.cyanLight,
              opacity: codeIn,
              textShadow: "0 0 18px rgba(6,182,212,0.5)",
            }}
          >
            &lt;Mubarok /&gt;
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BrandIdent = withFonts(BrandIdentBase);
