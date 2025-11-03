// src/pages/Home.jsx
import React from "react";
import ProgramsSection from "./ProgramsSection";

// ⬇️ 이미지 파일을 모듈로 import (Vite/CRA 모두 URL 문자열로 번들됨)
import Bg1 from "../images/KakaoTalk_20251022_151104432.png";
import Bg2 from "../images/fe549cd3-de2e-42fb-8f4d-dec3eb213353.png";
import Bg3 from "../images/image_720 (1).png";
import Bg4 from "../images/KakaoTalk_20251031_162309082.png";

const SHELL_W = 1440;

/* =========================
   ULTRA SOFT Feather Masks
   ========================= */
function maskBottomUltra(px = 160) {
  const p1 = Math.round(px * 0.35);
  const p2 = Math.round(px * 0.62);
  const g = `linear-gradient(
    to bottom,
    #000 0%,
    #000 calc(100% - ${px}px),
    rgba(0,0,0,0.55) calc(100% - ${p2}px),
    rgba(0,0,0,0.28) calc(100% - ${p1}px),
    transparent 100%
  )`;
  return {
    WebkitMaskImage: g, maskImage: g,
    WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
  };
}

function maskTopUltra(px = 90) {
  const p1 = Math.round(px * 0.28);
  const p2 = Math.round(px * 0.55);
  const p3 = Math.round(px * 0.82);
  const g = `linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,0,0,0.18) ${p1}px,
    rgba(0,0,0,0.42) ${p2}px,
    rgba(0,0,0,0.75) ${p3}px,
    #000 ${px}px,
    #000 100%
  )`;
  return {
    WebkitMaskImage: g, maskImage: g,
    WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%", maskSize: "100% 100%",
  };
}

/* =========================
   Neutral Veil (아주 옅은 중성 베일)
   ========================= */
function FeatherBridge({ height = 200, opacity = 0.32, blur = 7 }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0, right: 0, bottom: -1,
        height,
        pointerEvents: "none",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.28) 60%, rgba(0,0,0,.6) 100%)",
        mixBlendMode: "multiply",
        opacity,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

/* =========================
   Background Section (import된 src 사용)
   ========================= */
function BackgroundSection({ src, alt = "", feather = 170, overlapNext = 76, bridge = true }) {
  return (
    <section className="w-full" style={{ position: "relative", zIndex: 3, marginBottom: -overlapNext }}>
      <img
        src={src}
        alt={alt}
        className="block w-full h-auto select-none pointer-events-none"
        loading="eager"
        decoding="async"
        style={{
          objectFit: "contain",
          objectPosition: "center",
          ...maskBottomUltra(feather),
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />
      {bridge && <FeatherBridge height={feather + 30} opacity={0.30} blur={8} />}
    </section>
  );
}

/* =========================
   Copy Band
   ========================= */
function CopyBand({
  title, titleLines, subtitle,
  align = "center", maxContentWidth = 1040,
  lineGap = 6, nowrap = true,
  featherTop = 90, pullUp = 52,
}) {
  const isCenter = align === "center";
  const lines = Array.isArray(titleLines) && titleLines.length ? titleLines : (title ? [title] : []);
  return (
    <section className="w-full" style={{ position: "relative", zIndex: 2, marginTop: -pullUp }}>
      <div className="mx-auto" style={{ width: SHELL_W, minWidth: SHELL_W }}>
        <div
          style={{
            margin: "56px 0",
            padding: "56px 56px",
            borderRadius: 34,
            background: "rgba(0,0,0,.76)",
            boxShadow: "0 14px 48px rgba(0,0,0,.42)",
            display: "flex",
            flexDirection: "column",
            alignItems: isCenter ? "center" : "flex-start",
            textAlign: isCenter ? "center" : "left",
            ...maskTopUltra(featherTop),
          }}
        >
          <div style={{ width: "100%", maxWidth: maxContentWidth }}>
            {!!lines.length && (
              <h2
                className="font-headline"
                style={{
                  margin: 0, fontWeight: 800, fontSize: 97, lineHeight: 1.3, letterSpacing: "-0.02em",
                }}
              >
                {lines.map((ln, i) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      marginTop: i ? lineGap : 0,
                      whiteSpace: nowrap ? "nowrap" : undefined,
                      wordBreak: "keep-all",
                    }}
                  >
                    {ln}
                  </span>
                ))}
              </h2>
            )}
            {subtitle && (
              <p
                className="font-subtext"
                style={{ marginTop: 16, fontSize: 29, lineHeight: 1.6, color: "rgba(255,255,255,.86)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   Main
   ========================= */
export default function Home() {
  return (
    <div className="bg-black text-white font-display min-h-screen overflow-x-auto">
      <main className="w-full">
        {/* HERO 1 → CopyBand */}
        <BackgroundSection src={Bg1} alt="Hero 1" feather={180} overlapNext={84} bridge />
        <CopyBand
          titleLines={["운동의 시작,", "변화의 '첫 걸음'"]}
          subtitle="당신의 결심 하나가 건강한 평생을 만듭니다."
          featherTop={96}
          pullUp={60}
        />

        {/* 프로그램(카드) */}
        <section className="w-full" style={{ position: "relative", zIndex: 1, marginTop: -16 }}>
          <div className="mx-auto" style={{ width: SHELL_W, minWidth: SHELL_W }}>
            <ProgramsSection />
          </div>
        </section>

        {/* 이후 시퀀스 */}
        <BackgroundSection src={Bg2} alt="Hero 2" feather={170} overlapNext={78} bridge />
        <CopyBand
          titleLines={["두려움은,", "자연스러운 시작입니다"]}
          subtitle="시작은 작아도 비로소 지속이 거름이 될 때, 내일은 성장합니다."
          featherTop={90}
          pullUp={54}
        />

        <BackgroundSection src={Bg3} alt="Hero 3" feather={160} overlapNext={72} bridge />
        <CopyBand
          titleLines={["움직이면,", "달라집니다"]}
          subtitle="지속이 거름이 될 때, 비로소 내일은 자랍니다."
          featherTop={86}
          pullUp={50}
        />

        <BackgroundSection src={Bg4} alt="Hero 4" feather={160} overlapNext={64} bridge />
      </main>

      {/* 푸터(현행 유지) */}
      <footer
        className="border-t border-[#2A2A2A] bg-black"
        style={{ width: SHELL_W, padding: "48px 48px 64px", margin: "0 auto" }}
      >
        <div style={{ width: SHELL_W - 96, margin: "0 auto" }}>
          <div
            className="flex items-center gap-4"
            style={{ width: "100%", justifyContent: "space-between", marginBottom: 32 }}
          >
            {[
              { icon: "corporate_fare", text: "회사소개" },
              { icon: "description", text: "이용약관" },
              { icon: "privacy_tip", text: "개인정보처리방침" },
              { icon: "photo_camera", text: "INSTAGRAM" },
              { icon: "forum", text: "채널상담" },
            ].map((item, i) => (
              <a
                key={i}
                href="#"
                className="flex items-center justify-center transition-colors duration-300"
                style={{
                  width: 248, height: 52,
                  border: "1px solid #D6A84F",
                  color: "#D6A84F",
                  background: "black",
                  gap: 8, textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#D6A84F";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "black";
                  e.currentTarget.style.color = "#D6A84F";
                }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.text}
              </a>
            ))}
          </div>

          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, lineHeight: "22px" }}>
            <p>
              <span style={{ color: "#fff", fontWeight: 600 }}>주식회사 스티치</span> | 대표: 홍길동 | 사업자등록번호: 123-45-67890 | 통신판매업신고번호: 제2024-서울강남-00000호
            </p>
            <p>주소: 서울특별시 강남구 테헤란로 123, 4층 | TEL: 02-1234-5678 | E-MAIL: contact@stitchdesign.com</p>
            <p style={{ paddingTop: 16, color: "#6b7280" }}>COPYRIGHT © STITCH DESIGN ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
