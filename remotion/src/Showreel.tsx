import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { LogoMark, LogoVideo, FontsStyle, useWaitFonts, BRAND } from "./Logo";
import { SHOWREEL_DURATION, SCENES, SR } from "./showreelData";

/* ------------------------------------------------------------------ */
/* Shared background — matches the site's hero aesthetic               */
/* ------------------------------------------------------------------ */
const Orbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orb = (size: number, color: string, ax: number, ay: number, sx: number, sy: number, ox: number, oy: number) => {
    const x = 50 + Math.sin(frame / sx + ox) * ax;
    const y = 50 + Math.cos(frame / sy + oy) * ay;
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
          background: `radial-gradient(circle, ${color} 0%, transparent 66%)`,
        }}
      />
    );
  };
  return (
    <AbsoluteFill>
      {orb(1050, "rgba(6,182,212,0.13)", 15, 10, 230, 280, 0, 1.4)}
      {orb(700, "rgba(20,184,166,0.11)", 18, 13, 270, 200, 2.2, 0.4)}
      {orb(560, "rgba(34,211,238,0.08)", 22, 16, 190, 240, 4.1, 2.8)}
    </AbsoluteFill>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const items = new Array(18).fill(0).map((_, i) => ({
    x: random(`sx-${i}`) * 100,
    size: 2 + random(`ss-${i}`) * 3,
    speed: 0.5 + random(`sv-${i}`) * 1.1,
    offset: random(`so-${i}`) * 1200,
    tw: 0.2 + random(`st-${i}`) * 0.45,
  }));
  return (
    <AbsoluteFill>
      {items.map((p, i) => {
        const y = 1120 - ((p.offset + frame * p.speed) % 1240);
        const op = p.tw * (0.55 + 0.45 * Math.sin(frame / 17 + i * 1.7));
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
              backgroundColor: i % 3 === 0 ? BRAND.cyanLight : BRAND.cyan,
              opacity: op,
              boxShadow: `0 0 ${p.size * 3}px rgba(6,182,212,0.5)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const ShowreelBackground: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BRAND.slate, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }}
    />
    <Orbs />
    <Particles />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, transparent 52%, rgba(2,6,23,0.6) 100%)",
      }}
    />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const CL = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Fade in/out wrapper for a scene of `dur` frames */
const Fader: React.FC<{ dur: number; children: React.ReactNode }> = ({
  dur,
  children,
}) => {
  const fr = useCurrentFrame();
  const o =
    interpolate(fr, [0, 12], [0, 1], CL) *
    interpolate(fr, [dur - 16, dur - 2], [1, 0], CL);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const kickerStyle: React.CSSProperties = {
  fontFamily: '"Space Grotesk"',
  fontSize: 22,
  fontWeight: 700,
  letterSpacing: "0.34em",
  color: BRAND.cyanLight,
  textTransform: "uppercase",
};

const SceneHeading: React.FC<{ kicker: string; title: string; titleBn?: string }> = ({
  kicker,
  title,
  titleBn,
}) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 14], [0, 1], CL);
  const y = interpolate(fr, [0, 18], [26, 0], {
    ...CL,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ textAlign: "center", opacity: o, transform: `translateY(${y}px)` }}>
      <div style={kickerStyle}>{kicker}</div>
      <div
        style={{
          fontFamily: '"Space Grotesk"',
          fontSize: 64,
          fontWeight: 700,
          color: BRAND.white,
          marginTop: 14,
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </div>
      {titleBn ? (
        <div
          style={{
            fontFamily: '"SolaimanLipi"',
            fontSize: 28,
            color: BRAND.cyanLight,
            marginTop: 8,
            opacity: 0.9,
          }}
        >
          {titleBn}
        </div>
      ) : null}
      <div
        style={{
          width: 120,
          height: 3,
          margin: "22px auto 0",
          borderRadius: 3,
          background:
            "linear-gradient(90deg, transparent, rgba(34,211,238,0.9), transparent)",
        }}
      />
    </div>
  );
};

/* Minimal stroke icons */
const Icon: React.FC<{ kind: string; size?: number }> = ({ kind, size = 30 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="9.5" r="1.15" fill="#fff" stroke="none" />
          <circle cx="14.5" cy="8.6" r="1.15" fill="#fff" stroke="none" />
          <circle cx="15.5" cy="13.8" r="1.15" fill="#fff" stroke="none" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <rect x="7" y="3" width="10" height="18" rx="2.4" />
          <path d="M11 17.8h2" />
        </svg>
      );
    case "zap":
      return (
        <svg {...common}>
          <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.4" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      );
    case "cap":
      return (
        <svg {...common}>
          <path d="m2.5 9.5 9.5-4.5 9.5 4.5-9.5 4.5-9.5-4.5z" />
          <path d="M6.5 11.6v4.2c0 1.2 2.5 2.6 5.5 2.6s5.5-1.4 5.5-2.6v-4.2" />
        </svg>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Scene 1 — Hero                                                      */
/* ------------------------------------------------------------------ */
const HeroScene: React.FC = () => {
  const fr = useCurrentFrame();
  const dur = SCENES.hero.dur;
  const nameIn = interpolate(fr, [6, 34], [0, 1], CL);
  const nameY = interpolate(fr, [6, 36], [36, 0], { ...CL, easing: Easing.out(Easing.cubic) });
  const roleIn = interpolate(fr, [26, 46], [0, 1], CL);
  const bnIn = interpolate(fr, [38, 58], [0, 1], CL);
  const tagIn = interpolate(fr, [50, 70], [0, 1], CL);
  const pillIn = interpolate(fr, [62, 82], [0, 1], CL);
  const glowPulse = 0.35 + Math.sin(fr / 20) * 0.1;

  return (
    <Fader dur={dur}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: 130,
            width: 760,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.20) 0%, transparent 68%)",
            opacity: glowPulse,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: '"Space Grotesk"',
              fontSize: 118,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: BRAND.white,
              opacity: nameIn,
              transform: `translateY(${nameY}px)`,
              textShadow: "0 4px 60px rgba(6,182,212,0.35)",
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            MD MUBAROK
            <span style={{ color: BRAND.cyanLight }}> HOSIN</span>
          </div>
          <div
            style={{
              fontFamily: '"Space Grotesk"',
              fontSize: 40,
              fontWeight: 500,
              color: "rgba(226,232,240,0.95)",
              marginTop: 26,
              opacity: roleIn,
            }}
          >
            {SR.personal.role}
          </div>
          <div
            style={{
              fontFamily: '"SolaimanLipi"',
              fontSize: 30,
              color: BRAND.cyanLight,
              marginTop: 12,
              opacity: bnIn,
            }}
          >
            {SR.personal.roleBn} · {SR.personal.locationBn}
          </div>
          <div
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: tagIn,
            }}
          >
            <div style={{ width: 56, height: 2, background: "rgba(34,211,238,0.6)" }} />
            <div
              style={{
                fontFamily: '"Inter"',
                fontSize: 22,
                color: "rgba(203,213,225,0.85)",
                letterSpacing: "0.08em",
              }}
            >
              {SR.personal.tagline}
            </div>
            <div style={{ width: 56, height: 2, background: "rgba(34,211,238,0.6)" }} />
          </div>
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 26px",
              borderRadius: 999,
              border: "1px solid rgba(74,222,128,0.45)",
              background: "rgba(74,222,128,0.08)",
              opacity: pillIn,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 12px rgba(74,222,128,0.9)",
              }}
            />
            <div
              style={{
                fontFamily: '"Space Grotesk"',
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: "#86efac",
                textTransform: "uppercase",
              }}
            >
              Open to work
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Fader>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 2 — Stats                                                     */
/* ------------------------------------------------------------------ */
const StatCard: React.FC<{ value: number; suffix: string; label: string; labelBn: string; i: number }> = ({
  value,
  suffix,
  label,
  labelBn,
  i,
}) => {
  const fr = useCurrentFrame();
  const start = 14 + i * 9;
  const o = interpolate(fr, [start, start + 18], [0, 1], CL);
  const y = interpolate(fr, [start, start + 22], [40, 0], { ...CL, easing: Easing.out(Easing.cubic) });
  const n = Math.round(
    interpolate(fr, [start + 6, start + 52], [0, value], { ...CL, easing: Easing.out(Easing.cubic) }),
  );
  return (
    <div
      style={{
        flex: 1,
        padding: "38px 20px",
        borderRadius: 26,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(148,163,184,0.20)",
        textAlign: "center",
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: '"Space Grotesk"',
          fontSize: 88,
          fontWeight: 700,
          color: BRAND.cyanLight,
          textShadow: "0 0 34px rgba(6,182,212,0.4)",
        }}
      >
        {n}
        <span style={{ fontSize: 56 }}>{suffix}</span>
      </div>
      <div
        style={{
          fontFamily: '"Space Grotesk"',
          fontSize: 21,
          fontWeight: 600,
          color: BRAND.white,
          marginTop: 8,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: '"SolaimanLipi"', fontSize: 18, color: "rgba(148,163,184,0.9)", marginTop: 4 }}>
        {labelBn}
      </div>
    </div>
  );
};

const StatsScene: React.FC = () => {
  const dur = SCENES.stats.dur;
  return (
    <Fader dur={dur}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 110px" }}>
        <div style={{ marginBottom: 46 }}>
          <SceneHeading kicker="By the numbers" title="Impact & Experience" titleBn="অভিজ্ঞতা ও সাফল্য" />
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          {SR.stats.map((s, i) => (
            <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} labelBn={s.labelBn} i={i} />
          ))}
        </div>
      </AbsoluteFill>
    </Fader>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3 — Skills                                                    */
/* ------------------------------------------------------------------ */
const SkillBar: React.FC<{ name: string; level: number; i: number }> = ({ name, level, i }) => {
  const fr = useCurrentFrame();
  const start = 18 + i * 5;
  const o = interpolate(fr, [start, start + 14], [0, 1], CL);
  const x = interpolate(fr, [start, start + 20], [0, 1], { ...CL, easing: Easing.out(Easing.cubic) });
  const shown = Math.round(level * x);
  return (
    <div style={{ opacity: o }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: '"Space Grotesk"', fontSize: 22, fontWeight: 600, color: BRAND.white }}>
          {name}
        </span>
        <span style={{ fontFamily: '"Space Grotesk"', fontSize: 18, fontWeight: 700, color: BRAND.cyanLight }}>
          {shown}%
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          height: 12,
          borderRadius: 8,
          background: "rgba(148,163,184,0.14)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${level}%`,
            borderRadius: 8,
            transformOrigin: "left center",
            transform: `scaleX(${x})`,
            background: "linear-gradient(90deg, #06b6d4, #14b8a6)",
            boxShadow: "0 0 16px rgba(6,182,212,0.45)",
          }}
        />
      </div>
    </div>
  );
};

const SkillsScene: React.FC = () => {
  const dur = SCENES.skills.dur;
  const half = Math.ceil(SR.skills.length / 2);
  const colA = SR.skills.slice(0, half);
  const colB = SR.skills.slice(half);
  return (
    <Fader dur={dur}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 150px" }}>
        <div style={{ marginBottom: 40 }}>
          <SceneHeading kicker="Tech stack" title="Skills & Technologies" titleBn="দক্ষতা ও প্রযুক্তি" />
        </div>
        <div style={{ display: "flex", gap: 64 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            {colA.map((s, i) => (
              <SkillBar key={s.name} name={s.name} level={s.level} i={i} />
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            {colB.map((s, i) => (
              <SkillBar key={s.name} name={s.name} level={s.level} i={i + half} />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Fader>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 4 — Projects                                                  */
/* ------------------------------------------------------------------ */
const ProjectCard: React.FC<{ p: (typeof SR.projects)[number]; i: number }> = ({ p, i }) => {
  const fr = useCurrentFrame();
  const start = 16 + i * 12;
  const o = interpolate(fr, [start, start + 18], [0, 1], CL);
  const y = interpolate(fr, [start, start + 24], [54, 0], { ...CL, easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        flex: 1,
        padding: "34px 30px",
        borderRadius: 26,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(148,163,184,0.20)",
        borderTop: "3px solid rgba(6,182,212,0.75)",
        opacity: o,
        transform: `translateY(${y}px)`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          fontFamily: '"Space Grotesk"',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          color: "#86efac",
          border: "1px solid rgba(74,222,128,0.4)",
          background: "rgba(74,222,128,0.08)",
          borderRadius: 999,
          padding: "4px 12px",
        }}
      >
        ★ FEATURED
      </div>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(135deg, #22d3ee, #14b8a6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Space Grotesk"',
          fontSize: 22,
          fontWeight: 700,
          color: BRAND.slate,
        }}
      >
        {String(i + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          fontFamily: '"Space Grotesk"',
          fontSize: 25,
          fontWeight: 700,
          color: BRAND.white,
          marginTop: 20,
          lineHeight: 1.2,
        }}
      >
        {p.title}
      </div>
      <div
        style={{
          fontFamily: '"Inter"',
          fontSize: 15.5,
          color: "rgba(203,213,225,0.85)",
          marginTop: 10,
          lineHeight: 1.5,
          minHeight: 68,
        }}
      >
        {p.desc}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {p.tags.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: '"Space Grotesk"',
              fontSize: 12.5,
              fontWeight: 600,
              color: BRAND.cyanLight,
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 999,
              padding: "5px 13px",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

const ProjectsScene: React.FC = () => {
  const dur = SCENES.projects.dur;
  const fr = useCurrentFrame();
  const moreIn = interpolate(fr, [72, 90], [0, 1], CL);
  return (
    <Fader dur={dur}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 100px" }}>
        <div style={{ marginBottom: 42 }}>
          <SceneHeading kicker="Selected work" title="Featured Projects" titleBn="নির্বাচিত প্রজেক্ট" />
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {SR.projects.map((p, i) => (
            <ProjectCard key={p.title} p={p} i={i} />
          ))}
        </div>
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            fontFamily: '"Space Grotesk"',
            fontSize: 17,
            color: "rgba(148,163,184,0.85)",
            opacity: moreIn,
          }}
        >
          + {SR.moreProjects.join("   ·   ")}
        </div>
      </AbsoluteFill>
    </Fader>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 5 — Services                                                  */
/* ------------------------------------------------------------------ */
const ServiceCard: React.FC<{ s: (typeof SR.services)[number]; i: number }> = ({ s, i }) => {
  const fr = useCurrentFrame();
  const start = 14 + i * 10;
  const o = interpolate(fr, [start, start + 18], [0, 1], CL);
  const y = interpolate(fr, [start, start + 22], [36, 0], { ...CL, easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "center",
        padding: "26px 30px",
        borderRadius: 24,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(148,163,184,0.20)",
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "linear-gradient(135deg, #22d3ee, #14b8a6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 8px 26px rgba(6,182,212,0.35)",
        }}
      >
        <Icon kind={s.icon} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: '"Space Grotesk"', fontSize: 24, fontWeight: 700, color: BRAND.white }}>
            {s.title}
          </span>
          <span style={{ fontFamily: '"SolaimanLipi"', fontSize: 18, color: BRAND.cyanLight }}>
            {s.titleBn}
          </span>
        </div>
        <div style={{ fontFamily: '"Inter"', fontSize: 15, color: "rgba(203,213,225,0.8)", marginTop: 6 }}>
          {s.desc}
        </div>
      </div>
    </div>
  );
};

const ServicesScene: React.FC = () => {
  const dur = SCENES.services.dur;
  return (
    <Fader dur={dur}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 170px" }}>
        <div style={{ marginBottom: 40 }}>
          <SceneHeading kicker="What I do" title="Services" titleBn="সেবাসমূহ" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {SR.services.map((s, i) => (
            <ServiceCard key={s.title} s={s} i={i} />
          ))}
        </div>
      </AbsoluteFill>
    </Fader>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 6 — Experience & Education timeline                           */
/* ------------------------------------------------------------------ */
const TimelineRow: React.FC<{ item: (typeof SR.timeline)[number]; i: number; total: number }> = ({
  item,
  i,
  total,
}) => {
  const fr = useCurrentFrame();
  const start = 16 + i * 14;
  const o = interpolate(fr, [start, start + 18], [0, 1], CL);
  const x = interpolate(fr, [start, start + 22], [-40, 0], { ...CL, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ display: "flex", gap: 26, opacity: o, transform: `translateX(${x}px)` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30 }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "3px solid #22d3ee",
            background: BRAND.slate,
            boxShadow: "0 0 14px rgba(6,182,212,0.6)",
            marginTop: 6,
          }}
        />
        {i < total - 1 ? (
          <div style={{ width: 2, flex: 1, background: "rgba(34,211,238,0.3)", marginTop: 4 }} />
        ) : null}
      </div>
      <div style={{ paddingBottom: i < total - 1 ? 34 : 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontFamily: '"Space Grotesk"', fontSize: 25, fontWeight: 700, color: BRAND.white }}>
            {item.title}
          </span>
          <span
            style={{
              fontFamily: '"Space Grotesk"',
              fontSize: 15,
              fontWeight: 600,
              color: BRAND.cyanLight,
              border: "1px solid rgba(6,182,212,0.35)",
              borderRadius: 999,
              padding: "3px 12px",
            }}
          >
            {item.period}
          </span>
        </div>
        <div style={{ fontFamily: '"Inter"', fontSize: 17, color: BRAND.cyanLight, marginTop: 5, opacity: 0.95 }}>
          {item.org}
        </div>
        {item.desc ? (
          <div style={{ fontFamily: '"Inter"', fontSize: 15, color: "rgba(203,213,225,0.75)", marginTop: 4 }}>
            {item.desc}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const TimelineScene: React.FC = () => {
  const dur = SCENES.timeline.dur;
  return (
    <Fader dur={dur}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 210px" }}>
        <div style={{ marginBottom: 38 }}>
          <SceneHeading kicker="Journey" title="Experience & Education" titleBn="অভিজ্ঞতা ও শিক্ষা" />
        </div>
        <div>
          {SR.timeline.map((item, i) => (
            <TimelineRow key={item.title} item={item} i={i} total={SR.timeline.length} />
          ))}
        </div>
      </AbsoluteFill>
    </Fader>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 7 — Certificates                                              */
/* ------------------------------------------------------------------ */
const CertRow: React.FC<{ c: (typeof SR.certificates)[number]; i: number }> = ({ c, i }) => {
  const fr = useCurrentFrame();
  const start = 12 + i * 7;
  const o = interpolate(fr, [start, start + 15], [0, 1], CL);
  const y = interpolate(fr, [start, start + 18], [24, 0], { ...CL, easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "17px 26px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(148,163,184,0.20)",
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(20,184,166,0.25))",
          border: "1px solid rgba(6,182,212,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon kind="cap" size={24} />
      </div>
      <div style={{ flex: 1, fontFamily: '"Space Grotesk"', fontSize: 20, fontWeight: 600, color: BRAND.white }}>
        {c.title}
      </div>
      <div style={{ fontFamily: '"Inter"', fontSize: 15, color: "rgba(203,213,225,0.8)", width: 190 }}>
        {c.issuer}
      </div>
      <div
        style={{
          fontFamily: '"Space Grotesk"',
          fontSize: 15,
          fontWeight: 700,
          color: BRAND.cyanLight,
          border: "1px solid rgba(6,182,212,0.35)",
          borderRadius: 999,
          padding: "4px 14px",
        }}
      >
        {c.date}
      </div>
    </div>
  );
};

const CertsScene: React.FC = () => {
  const dur = SCENES.certs.dur;
  return (
    <Fader dur={dur}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 200px" }}>
        <div style={{ marginBottom: 34 }}>
          <SceneHeading kicker="Certified" title="Certificates" titleBn="সার্টিফিকেট" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SR.certificates.map((c, i) => (
            <CertRow key={c.title} c={c} i={i} />
          ))}
        </div>
      </AbsoluteFill>
    </Fader>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 8 — Contact / Outro                                           */
/* ------------------------------------------------------------------ */
const OutroScene: React.FC = () => {
  const fr = useCurrentFrame();
  const dur = SCENES.outro.dur;
  const markSpringScale = interpolate(fr, [4, 30], [0.6, 1], { ...CL, easing: Easing.out(Easing.cubic) });
  const nameIn = interpolate(fr, [16, 40], [0, 1], CL);
  const lineIn = interpolate(fr, [30, 52], [0, 1], CL);
  const emailIn = interpolate(fr, [40, 60], [0, 1], CL);
  const socialIn = interpolate(fr, [50, 72], [0, 1], CL);
  const ctaIn = interpolate(fr, [62, 84], [0, 1], CL);
  const glowPulse = 0.4 + Math.sin(fr / 20) * 0.14;
  const bnIn = interpolate(fr, [22, 46], [0, 1], CL);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 66%)",
          opacity: glowPulse,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${markSpringScale})` }}>
          <LogoMark size={140} idPrefix="outro" />
        </div>
        <div
          style={{
            fontFamily: '"Space Grotesk"',
            fontSize: 62,
            fontWeight: 700,
            color: BRAND.white,
            marginTop: 26,
            letterSpacing: "0.02em",
            opacity: nameIn,
          }}
        >
          MD MUBAROK <span style={{ color: BRAND.cyanLight }}>HOSIN</span>
        </div>
        <div
          style={{
            fontFamily: '"SolaimanLipi"',
            fontSize: 27,
            color: BRAND.cyanLight,
            marginTop: 8,
            opacity: bnIn,
          }}
        >
          {SR.personal.nameBn}
        </div>
        <div
          style={{
            width: 340,
            height: 3,
            borderRadius: 3,
            margin: "24px 0 22px",
            transform: `scaleX(${lineIn})`,
            background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.9), transparent)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: emailIn,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #22d3ee, #14b8a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon kind="mail" size={22} />
          </div>
          <div style={{ fontFamily: '"Space Grotesk"', fontSize: 27, fontWeight: 600, color: BRAND.white }}>
            {SR.personal.email}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 26, opacity: socialIn }}>
          {SR.socials.map((s) => (
            <div key={s.short} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(6,182,212,0.15)",
                  border: "1px solid rgba(6,182,212,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: '"Space Grotesk"',
                  fontSize: 15,
                  fontWeight: 700,
                  color: BRAND.cyanLight,
                }}
              >
                {s.short}
              </div>
              <div style={{ fontFamily: '"Inter"', fontSize: 15, color: "rgba(203,213,225,0.85)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: '"Space Grotesk"',
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "rgba(226,232,240,0.95)",
            opacity: ctaIn,
          }}
        >
          Let&apos;s build something great together
        </div>
      </div>
      {/* fade the whole scene out at the very end for a clean loop restart */}
      <AbsoluteFill
        style={{
          backgroundColor: BRAND.slate,
          opacity: interpolate(fr, [dur - 12, dur - 1], [0, 1], CL),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Main composition — all scenes, sequenced                            */
/* ------------------------------------------------------------------ */
export const Showreel: React.FC = () => {
  useWaitFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.slate }}>
      <FontsStyle />
      <ShowreelBackground />

      {/* S0 — brand intro (logo reveal, own bg) */}
      <Sequence from={SCENES.intro.from} durationInFrames={SCENES.intro.dur}>
        <Fader dur={SCENES.intro.dur}>
          <LogoVideo />
        </Fader>
      </Sequence>

      {/* S1 — hero */}
      <Sequence from={SCENES.hero.from} durationInFrames={SCENES.hero.dur}>
        <HeroScene />
      </Sequence>

      {/* S2 — stats */}
      <Sequence from={SCENES.stats.from} durationInFrames={SCENES.stats.dur}>
        <StatsScene />
      </Sequence>

      {/* S3 — skills */}
      <Sequence from={SCENES.skills.from} durationInFrames={SCENES.skills.dur}>
        <SkillsScene />
      </Sequence>

      {/* S4 — projects */}
      <Sequence from={SCENES.projects.from} durationInFrames={SCENES.projects.dur}>
        <ProjectsScene />
      </Sequence>

      {/* S5 — services */}
      <Sequence from={SCENES.services.from} durationInFrames={SCENES.services.dur}>
        <ServicesScene />
      </Sequence>

      {/* S6 — experience & education */}
      <Sequence from={SCENES.timeline.from} durationInFrames={SCENES.timeline.dur}>
        <TimelineScene />
      </Sequence>

      {/* S7 — certificates */}
      <Sequence from={SCENES.certs.from} durationInFrames={SCENES.certs.dur}>
        <CertsScene />
      </Sequence>

      {/* S8 — contact / outro */}
      <Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.dur}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
