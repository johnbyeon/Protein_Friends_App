// src/pages/ProgramsSection.jsx
import React from "react";

import ptMain from "../images/59ce4ee453d0dfb06c95c5ef1e417989.jpg";
import ptSub from "../images/PT.png";
import healthMain from "../images/hearth.png";
import healthSub from "../images/die.png";
import orientMain from "../images/sssangddam.png";
import orientSub from "../images/sangdam.png";

/** 상단 ULTRA SOFT 페더(투명→불투명) */
function maskTopUltra(px = 64) {
  const p1 = Math.round(px * 0.30);
  const p2 = Math.round(px * 0.58);
  const p3 = Math.round(px * 0.84);
  const g = `linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,0,0,0.16) ${p1}px,
    rgba(0,0,0,0.38) ${p2}px,
    rgba(0,0,0,0.70) ${p3}px,
    #000 ${px}px,
    #000 100%
  )`;
  return { WebkitMaskImage: g, maskImage: g, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" };
}

export default function ProgramsSection() {
  const SHELL_W = 1440;
  const WORK_W = 1440;
  const GAP = 12;
  const CARD_W = 472;
  const MAIN_H = 354;
  const SUB_H = 272;

  const cardBase = {
    width: CARD_W,
    borderRadius: 20,
    overflow: "hidden",
    background: "rgba(0,0,0,.32)",
    boxShadow: "0 28px 68px rgba(0,0,0,.46)",
    border: "1px solid rgba(255,255,255,.10)",
  };

  const pill = {
    position: "absolute", left: 12, top: 12, display: "flex", gap: 8,
    padding: "6px 10px", borderRadius: 999, fontSize: 12,
    background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,.2)",
  };

  return (
    <section
      id="programs"
      className="bg-transparent"
      style={{
        width: SHELL_W, margin: "0 auto",
        padding: "24px 0 72px",
        position: "relative", zIndex: 1,
        marginTop: -10,                 // 위 섹션과 살짝 겹침
        ...maskTopUltra(64),            // 상단 ULTRA SOFT 페더
      }}
    >
      {/* 아주 옅은 중성 베일: 형광 림 눌러서 경계 부드럽게 */}
      <div
        aria-hidden
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: 58,
          pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,.26), rgba(0,0,0,0))",
          mixBlendMode: "multiply",
          opacity: 0.34,   // 더 옅게
          filter: "blur(0.7px)"
        }}
      />

      <div style={{ width: WORK_W, margin: "0 auto" }}>
        {/* 타이틀 */}
        <div style={{ margin: "0 12px 24px 12px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <span style={{ display: "block", fontSize: 12, letterSpacing: ".02em", opacity: 0.8 }}>
                PROGRAMS — Built around your pace.
              </span>
              <span style={{ display: "block", fontSize: 28, fontWeight: 600 }}>
                당신의 페이스에 맞춘 3가지 루틴
              </span>
            </div>
          </div>
        </div>

        {/* 472×3 + gap12×2 = 1440 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${CARD_W}px ${CARD_W}px ${CARD_W}px`,
            columnGap: GAP, rowGap: GAP, width: WORK_W,
          }}
        >
          {/* ===== PT ===== */}
          <article className="group" style={cardBase}>
            <figure style={{ position: "relative", width: CARD_W, height: MAIN_H, overflow: "hidden" }}>
              <img
                src={ptMain} alt="PT 메인"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .45s" }}
                className="group-hover:scale-[1.03]"
              />
              <figcaption style={pill}>
                <span className="k">퍼스널 트레이닝</span>
                <span className="e" style={{ opacity: 0.8 }}>PT</span>
              </figcaption>
              <div
                style={{ pointerEvents: "none", position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,.42), transparent)" }}
              />
            </figure>

            <figure style={{ width: CARD_W, height: SUB_H, overflow: "hidden" }}>
              <img src={ptSub} alt="PT 서브" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </figure>

            <div style={{ padding: "22px 24px 24px" }}>
              <h4 className="k" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>PT — 밀착 코칭</h4>
              <p className="e" style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>
                Form correction, 1:1 progression, habit building.
              </p>
            </div>
          </article>

          {/* ===== HEALTH ===== */}
          <article className="group" style={cardBase}>
            <figure style={{ position: "relative", width: CARD_W, height: MAIN_H, overflow: "hidden" }}>
              <img
                src={healthMain} alt="헬스 메인"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .45s" }}
                className="group-hover:scale-[1.03]"
              />
              <figcaption style={pill}>
                <span className="k">헬스</span>
                <span className="e" style={{ opacity: 0.8 }}>HEALTH</span>
              </figcaption>
              <div
                style={{ pointerEvents: "none", position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,.42), transparent)" }}
              />
            </figure>

            <figure style={{ width: CARD_W, height: SUB_H, overflow: "hidden" }}>
              <img src={healthSub} alt="헬스 서브" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </figure>

            <div style={{ padding: "22px 24px 24px" }}>
              <h4 className="k" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>헬스 — 루틴 & 퍼포먼스</h4>
              <p className="e" style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>
                Strength, conditioning, clear week splits.
              </p>
            </div>
          </article>

          {/* ===== ORIENTATION ===== */}
          <article className="group" style={cardBase}>
            <figure style={{ position: "relative", width: CARD_W, height: MAIN_H, overflow: "hidden" }}>
              <img
                src={orientMain} alt="1:1 상담 메인"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .45s" }}
                className="group-hover:scale-[1.03]"
              />
              <figcaption style={pill}>
                <span className="k">1:1 상담</span>
                <span className="e" style={{ opacity: 0.8 }}>ORIENTATION</span>
              </figcaption>
              <div
                style={{ pointerEvents: "none", position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,.42), transparent)" }}
              />
            </figure>

            <figure style={{ width: CARD_W, height: SUB_H, overflow: "hidden" }}>
              <img src={orientSub} alt="1:1 상담 서브" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </figure>

            <div style={{ padding: "22px 24px 24px" }}>
              <h4 className="k" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>1:1 상담 — 시작 설계</h4>
              <p className="e" style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>
                Goal mapping, InBody, tailored plan.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
