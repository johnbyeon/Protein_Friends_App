// src/components/BackgroundSection.jsx
import React, { useEffect, useRef } from "react";
import { maskBottomUltra } from "../utils/maskUtils";
import FeatherBridge from "./FeatherBridge";

import Bg1 from "../images/KakaoTalk_20251022_151104432_2x_sharp.png";
import Bg2 from "../images/fe549cd3-de2e-42fb-8f4d-dec3eb213353_2x_sharp.png";
import Bg3 from "../images/KakaoTalk_20251104_124953626.png";
import Bg4 from "../images/KakaoTalk_20251031_162309082_2x_sharp.png";

import "../styles/neonBeamFlow.css";
import "../styles/neonIllusion.css";   // ← 누락된 거 다시 명시

const backgroundMap = { hero1: Bg1, hero2: Bg2, hero3: Bg3, hero4: Bg4 };

export default function BackgroundSection({
  name = "hero1",
  alt = "",
  feather = 170,
  overlapNext = 76,
  bridge = true,
  fit = "cover",
  crisp = true,

  // ==== BG3 고정 옵션 ==== (값 그대로 둠)
  palette = "emerald",
  lineWidth = 2,
  extendBottom = 200,
  shimmerMs = 4800,
  flowMs = 9000,
  parallaxMax = 140,
}) {
  const src = backgroundMap[name];
  if (!src) return null;

  const isBG3 = name === "hero3";
  const secRef = useRef(null);

  // ===== BG3 전용 패럴랙스 (그대로) =====
  useEffect(() => {
    if (!isBG3 || !secRef.current) return;
    const el = secRef.current;
    let raf = 0;
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const t = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const shift = t * parallaxMax;
      el.style.setProperty("--bg3-parallax", `${shift}px`);
      el.style.setProperty("--bg3-parallax-neon", `${shift * 0.5}px`);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isBG3, parallaxMax]);

  // 🔹 BG3 전용 마스크 (위/아래 모두 페이드)
  const bg3MaskStyle = isBG3
    ? {
        WebkitMaskImage:
          "linear-gradient(to bottom," +
          "transparent 0px," +          // 맨 위는 완전 투명
          "black 220px," +              // 0~220px 구간에서 점점 나타남 → 검은 띠가 부드럽게 사라짐
          "black calc(100% - 260px)," + // 중간 구간은 완전히 보이게
          "transparent 100%)",          // 마지막 260px은 다시 서서히 투명 → 하단 페이드
        maskImage:
          "linear-gradient(to bottom," +
          "transparent 0px," +
          "black 220px," +
          "black calc(100% - 260px)," +
          "transparent 100%)",
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : maskBottomUltra(feather); // 다른 BG들은 기존 하단 마스크 그대로

  return (
    <section
      ref={secRef}
      className={isBG3 ? "bg3-wrap" : "w-full"} // ← bg3-fixed-illusion 삭제해서 이중 이미지/착시 제거
      style={{
        position: "relative",
        marginBottom: -overlapNext,
        overflow: "hidden",
        backgroundColor: "black",
        zIndex: 0,
        ...(isBG3 && { paddingBottom: extendBottom }),
      }}
      data-bg3={isBG3 ? "on" : undefined}
      data-bg3-palette={isBG3 ? palette : undefined}
      data-bg3-linew={isBG3 ? lineWidth : undefined}
      data-bg3-shimmer={isBG3 ? `${shimmerMs}ms` : undefined}
      data-bg3-flow={isBG3 ? `${flowMs}ms` : undefined}
      data-bg3-illusion={isBG3 ? "on" : undefined}
      aria-label={alt}
    >
      {/* 원본 배경 이미지 (BG3는 위·아래 마스크만) */}
      <img
        src={src}
        alt={alt}
        className={isBG3 ? "bg3-img" : "block select-none pointer-events-none"}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        style={{
          width: "100%",
          height: "auto",
          objectFit: fit,
          objectPosition: "center",
          imageRendering: isBG3 ? "auto" : crisp ? "crisp-edges" : "auto",
          ...(bg3MaskStyle || {}), // ← 여기서 위/아래 페이드 적용
          transform: isBG3
            ? "translate3d(0, calc(var(--bg3-parallax, 0px) * -1), 0)"
            : "none",
          willChange: isBG3 ? "transform" : "auto",
          filter: isBG3 ? "saturate(1.02) contrast(1.02)" : undefined,
        }}
      />

      {/* BG3 네온 빔 (네온 한 줄기 효과는 유지) */}
      {isBG3 && (
        <div
          className="bg3-neon"
          style={{
            ["--bg3-line-w"]: `${lineWidth}px`,
            ["--bg3-shimmer-ms"]: `${shimmerMs}ms`,
            ["--bg3-flow-ms"]: `${flowMs}ms`,
            transform:
              "translate3d(0, calc(var(--bg3-parallax-neon, 0px) * -1), 0)",
            willChange: "transform",
          }}
        >
          {/* 상단 페이드(오버레이)는 있어도 되고, 완전히 지워도 됨.
              이미지 마스크가 이미 위쪽을 부드럽게 처리하니까,
              혹시 너무 어둡게 보이면 이 div는 주석 처리해도 됨. */}
          <div className="bg3-fade-top" />

          <div className="bg3-stage">
            <div className="bg3-core" />
            <div className="bg3-colorflow" />
            <div className="bg3-fringe" />
            <div className="bg3-shimmer" />
          </div>

          {/* 하단 유기 페이드 유지 */}
          <div className="bg3-fade-bottom bg3-fade--organic" />
        </div>
      )}

      {/* BG3 전용 시접/그레인 유지 (경계 부드럽게) */}
      {isBG3 && (
        <div className="bg3-seams">
          <div className="bg3-seam-top" />
          <div className="bg3-seam-bottom" />
          <div className="bg3-grain" />
        </div>
      )}

      {/* 다른 히어로의 브릿지는 그대로 */}
      {bridge && !isBG3 && (
        <FeatherBridge height={feather + 30} opacity={0.3} blur={8} />
      )}
    </section>
  );
}
