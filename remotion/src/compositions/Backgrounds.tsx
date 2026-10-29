import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CodeGlyphs, hexAlpha, withFonts } from "../kit";
import { BRAND } from "../Logo";

/* ------------------------------------------------------------------ */
/* সাইটের লাইট-থিম ব্যাকগ্রাউন্ড ভিডিওগুলোর Remotion সোর্স                */
/* bg-grid.mp4 · bg-orbs.mp4 · bg-waves.mp4 · bg-hero.mp4              */
/* সবগুলো 1280×720 · 30fps · seamless loop                             */
/* ------------------------------------------------------------------ */

const LightStage: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 62%, #f1f5f9 100%)",
      }}
    />
    {/* soft cyan glow top-right */}
    <div
      style={{
        position: "absolute",
        right: -180,
        top: -180,
        width: 640,
        height: 640,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 66%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -160,
        bottom: -200,
        width: 560,
        height: 560,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 66%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

/* ---------------------------------- BgGrid ------------------------- */

export const BgGridBase: React.FC = () => {
  const frame = useCurrentFrame();
  const DUR = 300;
  const TILE = 88;
  const shift = ((frame / DUR) * TILE) % TILE; // seamless loop
  return (
    <LightStage>
      <CodeGlyphs dark={false} count={9} seed="bg" />
      {/* perspective floor */}
      <div
        style={{
          position: "absolute",
          left: "-32%",
          right: "-32%",
          bottom: "-4%",
          height: "72%",
          transform: "perspective(720px) rotateX(57deg)",
          transformOrigin: "50% 0%",
          backgroundImage: `linear-gradient(rgba(6,182,212,0.16) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(6,182,212,0.16) 1.5px, transparent 1.5px)`,
          backgroundSize: `${TILE}px ${TILE}px`,
          backgroundPosition: `0px ${shift}px`,
          maskImage: "linear-gradient(180deg, transparent 0%, black 34%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 34%)",
        }}
      />
      {/* horizon glow */}
      <div
        style={{
          position: "absolute",
          left: "18%",
          right: "18%",
          top: "37.5%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${hexAlpha(BRAND.cyan, 0.5)}, transparent)`,
          filter: "blur(1px)",
        }}
      />
      {/* faint sky grid */}
      <AbsoluteFill
        style={{
          opacity: 0.35,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />
    </LightStage>
  );
};

/* ---------------------------------- BgOrbs ------------------------- */

export const BgOrbsBase: React.FC = () => {
  const frame = useCurrentFrame();
  const DUR = 300;
  const t = (frame / DUR) * Math.PI * 2; // one full cycle → seamless
  const orb = (
    size: number,
    color: string,
    cx: number,
    cy: number,
    ax: number,
    ay: number,
    mul: number,
    ph: number
  ) => {
    const x = cx + Math.sin(t * mul + ph) * ax;
    const y = cy + Math.cos(t * mul + ph * 1.3) * ay;
    return (
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 66%)`,
        }}
      />
    );
  };
  return (
    <LightStage>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {orb(620, "rgba(6,182,212,0.13)", 30, 38, 9, 6, 1, 0)}
      {orb(460, "rgba(20,184,166,0.11)", 68, 62, 7, 8, 1, 2.1)}
      {orb(360, "rgba(34,211,238,0.10)", 82, 24, 6, 5, 2, 4.2)}
      {orb(300, "rgba(14,116,144,0.07)", 14, 78, 5, 6, 2, 1.2)}
      <CodeGlyphs dark={false} count={6} seed="bo" />
    </LightStage>
  );
};

/* ---------------------------------- BgWaves ------------------------ */

const wavePath = (w: number, h: number, wl: number, amp: number): string => {
  let d = `M0 ${h / 2}`;
  let x = 0;
  let up = true;
  while (x < w) {
    d += ` q ${wl / 4} ${up ? -amp : amp}, ${wl / 2} 0`;
    x += wl / 2;
    up = !up;
  }
  d += ` L ${w} ${h} L 0 ${h} Z`;
  return d;
};

const WaveBand: React.FC<{
  y: number;
  color: string;
  amp: number;
  wl: number;
  speedPx: number;
  dur: number;
  opacity: number;
  height: number;
}> = ({ y, color, amp, wl, speedPx, dur, opacity, height }) => {
  const frame = useCurrentFrame();
  const shift = ((frame / dur) * speedPx) % wl; // one wavelength per loop
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: `${y}%`, height, overflow: "hidden" }}>
      <svg
        width={2880}
        height={height}
        viewBox={`0 0 2880 ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block", transform: `translateX(${-shift}px)` }}
      >
        <path d={wavePath(2880, height, wl, amp)} fill={color} opacity={opacity} />
      </svg>
    </div>
  );
};

export const BgWavesBase: React.FC = () => {
  return (
    <LightStage>
      <CodeGlyphs dark={false} count={5} seed="bw" />
      <WaveBand y={44} color={BRAND.cyan} amp={26} wl={480} speedPx={480} dur={300} opacity={0.07} height={260} />
      <WaveBand y={56} color={BRAND.teal} amp={30} wl={560} speedPx={560} dur={300} opacity={0.08} height={300} />
      <WaveBand y={68} color={BRAND.cyanDeep} amp={24} wl={640} speedPx={640} dur={300} opacity={0.07} height={320} />
      <WaveBand y={80} color={BRAND.cyan} amp={20} wl={520} speedPx={520} dur={300} opacity={0.06} height={220} />
    </LightStage>
  );
};

/* ---------------------------------- BgHero ------------------------- */

export const BgHeroBase: React.FC = () => {
  const frame = useCurrentFrame();
  const DUR = 450;
  const t = (frame / DUR) * Math.PI * 2;
  const ringR = 120 + ((frame % 150) / 150) * 240;
  const ringO = 0.16 * (1 - (frame % 150) / 150);
  const particles = new Array(16).fill(0).map((_, i) => ({
    x: 8 + ((i * 61) % 84),
    speed: 22 + ((i * 37) % 26),
    off: (i * 97) % 450,
    size: 2.5 + ((i * 13) % 3),
  }));
  return (
    <LightStage>
      {/* grid */}
      <AbsoluteFill
        style={{
          opacity: 0.45,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.09) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* orbs */}
      <div
        style={{
          position: "absolute",
          left: `${26 + Math.sin(t) * 8}%`,
          top: `${40 + Math.cos(t) * 7}%`,
          width: 640,
          height: 640,
          marginLeft: -320,
          marginTop: -320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 66%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${74 + Math.cos(t * 2) * 5}%`,
          top: `${60 + Math.sin(t * 2) * 8}%`,
          width: 420,
          height: 420,
          marginLeft: -210,
          marginTop: -210,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 66%)",
        }}
      />
      {/* pulsing rings */}
      <div
        style={{
          position: "absolute",
          left: "28%",
          top: "44%",
          width: ringR * 2,
          height: ringR * 2,
          marginLeft: -ringR,
          marginTop: -ringR,
          borderRadius: "50%",
          border: `1.5px solid ${hexAlpha(BRAND.cyan, ringO)}`,
        }}
      />
      {/* rising particles */}
      {particles.map((p, i) => {
        const y = 105 - (((frame + p.off) / DUR) % 1) * 118 - ((frame + p.off) % DUR) / p.speed * 0.0;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: i % 3 === 0 ? BRAND.cyanLight : BRAND.cyan,
              opacity: 0.3,
            }}
          />
        );
      })}
      <CodeGlyphs dark={false} count={7} seed="bh" />
    </LightStage>
  );
};

export const BgGrid = withFonts(BgGridBase);
export const BgOrbs = withFonts(BgOrbsBase);
export const BgWaves = withFonts(BgWavesBase);
export const BgHero = withFonts(BgHeroBase);
