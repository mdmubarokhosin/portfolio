import React from "react";
import { Composition } from "remotion";
import {
  LogoFull,
  LogoMarkStill,
  LogoVideo,
} from "./Logo";
import { Showreel } from "./Showreel";
import { SHOWREEL_DURATION } from "./showreelData";
import { PROJECTS, COVERS } from "./data/projects";
import { ProjectShowcase } from "./compositions/ProjectShowcase";
import { ProjectPoster } from "./compositions/ProjectPoster";
import { CoverShowcase } from "./compositions/CoverShowcase";
import { BrandIdent } from "./compositions/BrandIdent";
import { BgGrid, BgOrbs, BgWaves, BgHero } from "./compositions/Backgrounds";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ---------------- Brand (existing) ---------------- */}
      <Composition
        id="Showreel"
        component={Showreel}
        durationInFrames={SHOWREEL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LogoVideo"
        component={LogoVideo}
        durationInFrames={160}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LogoMark"
        component={LogoMarkStill}
        durationInFrames={2}
        fps={30}
        width={1024}
        height={1024}
      />
      <Composition
        id="LogoFullLight"
        component={LogoFull}
        defaultProps={{ variant: "light" as const }}
        durationInFrames={2}
        fps={30}
        width={2400}
        height={800}
      />
      <Composition
        id="LogoFullDark"
        component={LogoFull}
        defaultProps={{ variant: "dark" as const }}
        durationInFrames={2}
        fps={30}
        width={2400}
        height={800}
      />

      {/* ---------------- Projects showcase (new) ---------------- */}
      <Composition
        id="ProjectShowcase"
        component={ProjectShowcase}
        durationInFrames={240}
        fps={30}
        width={960}
        height={540}
        defaultProps={{ slug: PROJECTS[0].slug }}
      />
      <Composition
        id="ProjectPoster"
        component={ProjectPoster}
        durationInFrames={2}
        fps={30}
        width={960}
        height={540}
        defaultProps={{ slug: PROJECTS[0].slug }}
      />

      {/* ---------------- Site cover videos (editable recreations) ---------------- */}
      <Composition
        id="CoverShowcase"
        component={CoverShowcase}
        durationInFrames={240}
        fps={30}
        width={960}
        height={540}
        defaultProps={{ slug: COVERS[2].slug }}
      />
      <Composition
        id="BrandIdent"
        component={BrandIdent}
        durationInFrames={240}
        fps={30}
        width={512}
        height={512}
      />

      {/* ---------------- Light background loops ---------------- */}
      <Composition
        id="BgGrid"
        component={BgGrid}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="BgOrbs"
        component={BgOrbs}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="BgWaves"
        component={BgWaves}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="BgHero"
        component={BgHero}
        durationInFrames={450}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
