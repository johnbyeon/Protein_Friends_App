// src/components/BackgroundSection.jsx
import React from "react";
import { maskBottomUltra } from "../utils/maskUtils";
import FeatherBridge from "./FeatherBridge";   // 🔸 이 줄로 변경

import Bg1 from "../images/KakaoTalk_20251022_151104432_2x_sharp.png";
import Bg2 from "../images/fe549cd3-de2e-42fb-8f4d-dec3eb213353_2x_sharp.png";
import Bg3 from "../images/KakaoTalk_20251104_124953626.png";
import Bg4 from "../images/KakaoTalk_20251031_162309082_2x_sharp.png";

const backgroundMap = {
  hero1: Bg1,
  hero2: Bg2,
  hero3: Bg3,
  hero4: Bg4,
};

export default function BackgroundSection({
  name = "hero1",
  alt = "",
  feather = 170,
  overlapNext = 76,
  bridge = true,
  fit = "cover",
  crisp = true,
}) {
  const src = backgroundMap[name];

  if (!src) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[BackgroundSection] Unknown 'name' prop: ${name}`);
    }
    return null;
  }

  return (
    <section
      className="w-full"
      style={{
        position: "relative",
        marginBottom: -overlapNext,
        overflow: "hidden",
        backgroundColor: "black",
      }}
    >
      <img
        src={src}
        alt={alt}
        className="block select-none pointer-events-none"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        style={{
          width: "100%",
          height: "auto",
          objectFit: fit,
          objectPosition: "center",
          imageRendering: crisp ? "crisp-edges" : "auto",
          transform: "none",
          WebkitTransform: "none",
          willChange: "auto",
          ...maskBottomUltra(feather),
        }}
      />

      {bridge && <FeatherBridge height={feather + 30} opacity={0.3} blur={8} />}
    </section>
  );
}
