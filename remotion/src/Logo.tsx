import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ------------------------------------------------------------------ */
/* Brand constants — matches the site palette                          */
/* ------------------------------------------------------------------ */
export const BRAND = {
  slate: "#0f172a",
  cyan: "#06b6d4",
  cyanLight: "#22d3ee",
  cyanDeep: "#0e7490",
  teal: "#14b8a6",
  white: "#ffffff",
};

const EN_NAME = "MD MUBAROK HOSIN";
const BN_NAME = "মোঃ মোবারক হুসেন";

export const FONT_CSS = `
@font-face {
  font-family: "Space Grotesk";
  src: url("${staticFile("fonts/SpaceGrotesk-var-latin.woff2")}") format("woff2");
  font-weight: 300 700;
  font-style: normal;
}
@font-face {
  font-family: "Inter";
  src: url("${staticFile("fonts/Inter-var-latin.woff2")}") format("woff2");
  font-weight: 100 900;
  font-style: normal;
}
@font-face {
  font-family: "SolaimanLipi";
  src: url("${staticFile("fonts/SolaimanLipi.ttf")}") format("truetype");
  font-weight: 400 700;
  font-style: normal;
}
`;

/* Wait until webfonts are ready before rendering (delayRender pattern) */
export const useWaitFonts = (): void => {
  const [handle] = useState(() => delayRender("wait-for-fonts"));
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      document.fonts.load('700 100px "Space Grotesk"'),
      document.fonts.load('400 100px "SolaimanLipi"'),
      document.fonts.load('700 100px "SolaimanLipi"'),
      document.fonts.ready,
    ])
      .then(() => {
        if (!cancelled) continueRender(handle);
      })
      .catch(() => {
        if (!cancelled) continueRender(handle);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);
};

export const FontsStyle: React.FC = () => {
  return <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />;
};

/* ------------------------------------------------------------------ */
/* LogoMark — rounded-square badge with stroked "M" + circuit nodes    */
/* ------------------------------------------------------------------ */
export const M_PATH = "M 25 82 L 25 22 L 50 59 L 75 22 L 75 82";
const NODES: Array<[number, number]> = [
  [25, 22],
  [75, 22],
  [50, 59],
];

export const LogoMark: React.FC<{
  size: number;
  idPrefix?: string;
  /** 0..1 — stroke draw-on progress (1 = fully drawn) */
  drawProgress?: number;
  /** 0..1 — node pop-in progress */
  nodesIn?: number;
}> = ({ size, idPrefix = "mk", drawProgress = 1, nodesIn = 1 }) => {
  const gid = `${idPrefix}-grad`;
  const sid = `${idPrefix}-shine`;

  const mainOffset = 100 - Math.min(Math.max(drawProgress, 0), 1) * 100;
  const echoProgress = Math.min(Math.max(drawProgress * 1.18 - 0.12, 0), 1);
  const echoOffset = 100 - echoProgress * 100;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BRAND.cyanLight} />
          <stop offset="52%" stopColor={BRAND.cyan} />
          <stop offset="100%" stopColor={BRAND.teal} />
        </linearGradient>
        <linearGradient id={sid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.30)" />
          <stop offset="46%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.10)" />
        </linearGradient>
      </defs>

      {/* badge */}
      <rect x="2" y="2" width="96" height="96" rx="25" fill={`url(#${gid})`} />
      <rect x="2" y="2" width="96" height="96" rx="25" fill={`url(#${sid})`} />
      <rect
        x="2.9"
        y="2.9"
        width="94.2"
        height="94.2"
        rx="24.1"
        fill="none"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth="1.6"
      />

      {/* cyan echo of the M (depth) */}
      <path
        d={M_PATH}
        pathLength={100}
        fill="none"
        stroke="rgba(8,51,68,0.35)"
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={100}
        strokeDashoffset={echoOffset}
        transform="translate(2.6 2.8)"
      />

      {/* main white M */}
      <path
        d={M_PATH}
        pathLength={100}
        fill="none"
        stroke={BRAND.white}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={100}
        strokeDashoffset={mainOffset}
      />

      {/* circuit nodes */}
      {NODES.map(([x, y], i) => {
        const start = 0.42 + i * 0.16;
        const t = Math.min(Math.max((nodesIn - start) / 0.22, 0), 1);
        const e = 1 - Math.pow(1 - t, 3);
        const s = e;
        const ring = 0.55 * e;
        return (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
            <circle
              r={7.4}
              fill="none"
              stroke={`rgba(255,255,255,${ring})`}
              strokeWidth={1.7}
            />
            <circle r={4.1} fill={BRAND.white} />
            <circle r={1.7} fill={BRAND.cyan} />
          </g>
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* LogoVideo — animated logo reveal (1920x1080, 160f @30fps)           */
/* ------------------------------------------------------------------ */
const ParticleField: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = useMemo(() => {
    return new Array(26).fill(0).map((_, i) => ({
      x: random(`px-${i}`) * 100,
      size: 2 + random(`ps-${i}`) * 3.4,
      speed: 0.55 + random(`pv-${i}`) * 1.35,
      offset: random(`po-${i}`) * 1200,
      twinkle: 0.25 + random(`pt-${i}`) * 0.55,
    }));
  }, []);

  return (
    <AbsoluteFill>
      {particles.map((p, i) => {
        const travel = p.offset + frame * p.speed;
        const y = 1120 - (travel % 1240);
        const tw =
          0.55 + 0.45 * Math.sin(frame / 17 + i * 1.7);
        const opacity = p.twinkle * tw;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor:
                i % 3 === 0 ? BRAND.cyanLight : BRAND.cyan,
              opacity,
              boxShadow: `0 0 ${p.size * 3}px rgba(6,182,212,0.55)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Orbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orb = (
    size: number,
    color: string,
    ax: number,
    ay: number,
    sx: number,
    sy: number,
    ox: number,
    oy: number,
  ) => {
    const x = 50 + Math.sin((frame / sx) + ox) * ax;
    const y = 50 + Math.cos((frame / sy) + oy) * ay;
    return (
      <div
        key={`${size}-${ox}`}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
          filter: "blur(10px)",
        }}
      />
    );
  };

  return (
    <AbsoluteFill>
      {orb(980, "rgba(6,182,212,0.16)", 16, 11, 210, 260, 0, 1.4)}
      {orb(660, "rgba(20,184,166,0.14)", 19, 14, 260, 190, 2.2, 0.4)}
      {orb(520, "rgba(34,211,238,0.10)", 24, 17, 180, 230, 4.1, 2.8)}
    </AbsoluteFill>
  );
};

export const LogoVideo: React.FC = () => {
  useWaitFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* --- timings ---------------------------------------------------- */
  const bgIn = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: "clamp",
  });

  const markSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, stiffness: 110, mass: 0.9 },
  });

  const draw = interpolate(frame, [26, 64], [0, 1], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodesIn = interpolate(frame, [56, 76], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rule = interpolate(frame, [104, 126], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bnIn = interpolate(frame, [100, 122], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bnY = interpolate(frame, [100, 122], [24, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sweep = interpolate(frame, [120, 150], [-25, 125], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const zoom = interpolate(frame, [142, 160], [1, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowWarm = Math.min(Math.max((frame - 60) / 40, 0), 1);
  const glowPulse = 0.45 + Math.sin(frame / 21) * 0.16;
  const glowOpacity = glowWarm * glowPulse;

  const floatY = Math.sin(frame / 27) * 5;

  /* --- letter stagger for the EN name ------------------------------ */
  const letters = EN_NAME.split("").map((ch, i) => {
    const st = 58 + i * 1.7;
    const o = interpolate(frame, [st, st + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [st, st + 19], [30, 0], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <span
        key={i}
        style={{
          display: "inline-block",
          whiteSpace: "pre",
          opacity: o,
          transform: `translateY(${y}px)`,
        }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    );
  });

  /* --- render ------------------------------------------------------ */
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.slate, overflow: "hidden" }}>
      <FontsStyle />

      {/* grid */}
      <AbsoluteFill
        style={{
          opacity: bgIn * 0.5,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.09) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <Orbs />
      <ParticleField />

      {/* lockup */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${floatY}px) scale(${zoom})`,
        }}
      >
        {/* badge glow */}
        <div
          style={{
            position: "absolute",
            top: 150,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.30) 0%, rgba(6,182,212,0.10) 42%, transparent 70%)",
            opacity: glowOpacity,
            filter: "blur(6px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: bgIn,
          }}
        >
          {/* monogram */}
          <div
            style={{
              transform: `scale(${markSpring}) rotate(${(1 - markSpring) * -10}deg)`,
              opacity: Math.min(markSpring * 1.6, 1),
            }}
          >
            <LogoMark
              size={252}
              idPrefix="vid"
              drawProgress={draw}
              nodesIn={nodesIn}
            />
          </div>

          {/* english name — clipped for the light sweep */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              marginTop: 58,
              padding: "6px 26px",
            }}
          >
            <div
              style={{
                fontFamily: '"Space Grotesk"',
                fontWeight: 700,
                fontSize: 88,
                letterSpacing: "0.055em",
                color: BRAND.white,
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              {letters}
            </div>

            {/* light sweep */}
            <div
              style={{
                position: "absolute",
                top: -30,
                bottom: -30,
                left: `${sweep}%`,
                width: 150,
                transform: "translateX(-50%) rotate(16deg)",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)",
                mixBlendMode: "overlay",
                opacity: 0.95,
              }}
            />
          </div>

          {/* divider rule */}
          <div
            style={{
              marginTop: 24,
              width: 330,
              height: 3,
              borderRadius: 3,
              transform: `scaleX(${rule})`,
              background:
                "linear-gradient(90deg, transparent, rgba(34,211,238,0.9), rgba(20,184,166,0.9), transparent)",
              boxShadow: "0 0 14px rgba(6,182,212,0.45)",
            }}
          />

          {/* bengali name */}
          <div
            style={{
              marginTop: 28,
              fontFamily: '"SolaimanLipi"',
              fontSize: 56,
              color: BRAND.cyanLight,
              opacity: bnIn,
              transform: `translateY(${bnY}px)`,
              textShadow: "0 0 26px rgba(6,182,212,0.35)",
              textAlign: "center",
              lineHeight: 1.35,
            }}
          >
            {BN_NAME}
          </div>
        </div>
      </AbsoluteFill>

      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(2,6,23,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Stills                                                              */
/* ------------------------------------------------------------------ */
export const LogoMarkStill: React.FC = () => {
  useWaitFonts();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <FontsStyle />
      <LogoMark size={984} idPrefix="still" />
    </AbsoluteFill>
  );
};

export const LogoFull: React.FC<{ variant: "light" | "dark" }> = ({
  variant,
}) => {
  useWaitFonts();
  const onDark = variant === "dark";
  const nameColor = onDark ? BRAND.white : BRAND.slate;
  const bnColor = onDark ? BRAND.cyanLight : BRAND.cyanDeep;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 110,
      }}
    >
      <FontsStyle />
      <div style={{ display: "flex", alignItems: "center", gap: 72 }}>
        <LogoMark size={430} idPrefix={`full-${variant}`} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: '"Space Grotesk"',
              fontWeight: 700,
              fontSize: 146,
              letterSpacing: "0.045em",
              color: nameColor,
              lineHeight: 1.08,
              whiteSpace: "nowrap",
            }}
          >
            {EN_NAME}
          </div>
          <div
            style={{
              fontFamily: '"SolaimanLipi"',
              fontSize: 84,
              color: bnColor,
              marginTop: 20,
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {BN_NAME}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
