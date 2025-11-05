// src/components/LightStreaksBand.jsx
import React from "react";
import "../styles/lightStreaks.css";
import { FeatherBridge } from "../utils/maskUtils";

/**
 * LightStreaksBand
 * - hero2 와 hero4 사이에 들어가는 코드 기반 네온 스트라이프 배경
 * - height: 섹션 높이
 * - overlapNext: 다음 섹션과 겹치는 정도(기존 hero3 overlapNext 와 동일한 의미)
 */
export default function LightStreaksBand({
  height = 420,
  overlapNext = 72,
  bridge = true,
}) {
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
      {/* 네온 스트라이프 + 반사 */}
      <div className="light-streaks-shell" style={{ height }}>
        <div className="light-streaks-layer light-streaks-core" />
        <div className="light-streaks-layer light-streaks-reflection" />
        <div className="light-streaks-fade light-streaks-fade-top" />
        <div className="light-streaks-fade light-streaks-fade-bottom" />
      </div>

      {/* hero4 와의 연결을 위한 브릿지(기존 hero3 의 bridge 역할) */}
      {bridge && <FeatherBridge height={height / 2} opacity={0.25} blur={12} />}
    </section>
  );
}
