// src/pages/Home.jsx
import React from "react";
import ProgramsSection from "./ProgramsSection";

const SHELL_W = 1440;

/** 안전한 절대경로 */
function resolveImage(src) {
  if (!src) return "";
  const s = String(src);
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;
  try { return new URL(s, import.meta.url).href; } catch { return s.replace(/^\.\.\//, "/"); }
}

/* =========================
   ULTRA SOFT Feather Masks
   - S-curve 다중 스톱으로 경계/밴딩 최소화
   ========================= */
function maskBottomUltra(px = 160) {
  // 완만한 S-커브 : 불투명(#000) → 반투명 → 투명
  const p1 = Math.round(px * 0.35);
  const p2 = Math.round(px * 0.62);
  const p3 = Math.round(px * 0.82);
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
    WebkitMaskSize: "100% 100%", maskSize: "100% 100%"
  };
}

function maskTopUltra(px = 90) {
  // 투명 → 반투명 → 불투명(#000)으로 천천히
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
    WebkitMaskSize: "100% 100%", maskSize: "100% 100%"
  };
}

/* =========================
   Neutral Veil (아주 옅은 중성 베일)
   - 형광 라인/밝은 림을 눌러 경계 감춤
   ========================= */
function FeatherBridge({ height = 200, opacity = 0.32, blur = 7 }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute", left: 0, right: 0, bottom: -1, height,
        pointerEvents: "none",
        // 위는 거의 투명, 아래로 갈수록 살짝 어두워지는 베일
        background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,.28) 60%, rgba(0,0,0,.6) 100%)",
        mixBlendMode: "multiply",
        opacity,
        filter: `blur(${blur}px)`
      }}
    />
  );
}

/** 배경 섹션: 하단 ULTRA SOFT 페더 + 얕은 베일 + 미세 겹침 */
function BackgroundSection({ imageUrl, alt = "", feather = 170, overlapNext = 76, bridge = true }) {
  const url = resolveImage(imageUrl);
  return (
    <section className="w-full" style={{ position: "relative", zIndex: 3, marginBottom: -overlapNext }}>
      <img
        src={url}
        alt={alt}
        className="block w-full h-auto select-none pointer-events-none"
        loading="eager" decoding="async"
        style={{
          objectFit: "contain", objectPosition: "center",
          ...maskBottomUltra(feather),
          // 미세 밴딩 방지
          willChange: "transform", transform: "translateZ(0)"
        }}
      />
      {bridge && <FeatherBridge height={feather + 30} opacity={0.30} blur={8} />}
    </section>
  );
}

/** 카피 밴드: 상단 ULTRA SOFT 페더 + 살짝 겹침(더 옅게) */
function CopyBand({
  title, titleLines, subtitle,
  align = "center", maxContentWidth = 1040,
  lineGap = 6, nowrap = true,
  featherTop = 90, pullUp = 52
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
            display: "flex", flexDirection: "column",
            alignItems: isCenter ? "center" : "flex-start",
            textAlign: isCenter ? "center" : "left",
            ...maskTopUltra(featherTop)
          }}
        >
          <div style={{ width: "100%", maxWidth: maxContentWidth }}>
            {!!lines.length && (
              <h2 className="font-headline" style={{ margin: 0, fontWeight: 800, fontSize: 97, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                {lines.map((ln, i) => (
                  <span key={i} style={{ display: "block", marginTop: i ? lineGap : 0, whiteSpace: nowrap ? "nowrap" : undefined, wordBreak: "keep-all" }}>
                    {ln}
                  </span>
                ))}
              </h2>
            )}
            {subtitle && (
              <p className="font-subtext" style={{ marginTop: 16, fontSize: 29, lineHeight: 1.6, color: "rgba(255,255,255,.86)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-black text-white font-display min-h-screen overflow-x-auto">
      <main className="w-full">
        {/* HERO 1 → CopyBand */}
        <BackgroundSection
          imageUrl="../images/KakaoTalk_20251022_151104432.png"
          alt="Hero 1"
          feather={180} overlapNext={84} bridge
        />
        <CopyBand
          titleLines={["운동의 시작,", "변화의 '첫 걸음'"]}
          subtitle="당신의 결심 하나가 건강한 평생을 만듭니다."
          featherTop={96} pullUp={60}
        />

        {/* 프로그램(카드) */}
        <section className="w-full" style={{ position: "relative", zIndex: 1, marginTop: -16 }}>
          <div className="mx-auto" style={{ width: SHELL_W, minWidth: SHELL_W }}>
            <ProgramsSection />
          </div>
        </section>

        {/* 이후 시퀀스 동일 규칙 */}
        <BackgroundSection
          imageUrl="../images/fe549cd3-de2e-42fb-8f4d-dec3eb213353.png"
          alt="Hero 2"
          feather={170} overlapNext={78} bridge
        />
        <CopyBand
          titleLines={["두려움은,", "자연스러운 시작입니다"]}
          subtitle="시작은 작아도 비로소 지속이 거름이 될 때, 내일은 성장합니다."
          featherTop={90} pullUp={54}
        />

        <BackgroundSection
          imageUrl="../images/image_720 (1).png"
          alt="Hero 3"
          feather={160} overlapNext={72} bridge
        />
        <CopyBand
          titleLines={["움직이면,", "달라집니다"]}
          subtitle="지속이 거름이 될 때, 비로소 내일은 자랍니다."
          featherTop={86} pullUp={50}
        />

        <BackgroundSection
          imageUrl="../images/KakaoTalk_20251031_162309082.png"
          alt="Hero 4"
          feather={160} overlapNext={64} bridge
        />
      </main>

      {/* 푸터 */}
      <footer className="bg-black py-12 px-4 sm:px-12">
        <div className="container mx-auto flex flex-col items-center">
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
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
                className="flex-1 w-full text-center bg-black text-primary/30 py-3 px-4 border border-primary/30 hover:bg-neon-green hover:text-primary hover:ring-1 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.text}
              </a>
            ))}
          </div>

          <div className="text-center text-gray-400 text-sm space-y-1">
            <p>
              <span className="text-gray-400 font-semibold">주식회사 스티치</span> | 대표:
              홍길동 | 사업자등록번호: 123-45-67890 | 통신판매업신고번호:
              제2024-서울강남-00000호
            </p>
            <p>
              주소: 서울특별시 강남구 테헤란로 123, 4층 | TEL: 02-1234-5678 | E-MAIL:
              contact@stitchdesign.com
            </p>
            <p className="pt-4 text-gray-400">
              COPYRIGHT © STITCH DESIGN ALL RIGHTS RESERVED.
            </p>
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, lineHeight: "22px" }}>
            <p><span style={{ color: "#fff", fontWeight: 600 }}>주식회사 스티치</span> | 대표: 홍길동 | 사업자등록번호: 123-45-67890 | 통신판매업신고번호: 제2024-서울강남-00000호</p>
            <p>주소: 서울특별시 강남구 테헤란로 123, 4층 | TEL: 02-1234-5678 | E-MAIL: contact@stitchdesign.com</p>
            <p style={{ paddingTop: 16, color: "#6b7280" }}>COPYRIGHT © STITCH DESIGN ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
