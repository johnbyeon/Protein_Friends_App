// src/components/ArcIntro.jsx
import React from "react";

export default function ArcIntro({
  titleTop = "Once you move,",
  titleBottom = "everything begins to change.",
  maxWidth = 1440,
  paddingY = 120,
  arcStroke = 5,
  arcGlow = 22,
  arcStartColor = "#FF9F1C",
  arcEndColor = "#94F970",
  cardCount = 3,
  cardRadius = 18,
  cardStroke = "rgba(255,255,255,0.26)",
  cardFill = "rgba(255,255,255,0.06)",
  cardGlow = "rgba(0,255,120,0.22)",
  bgTop = "#081607",
  bgBottom = "#001B08",
}) {
  const W = maxWidth;
  const sidePad = 64;
  const gap = 48;
  const cardW = (W - sidePad * 2 - gap * (cardCount - 1)) / cardCount;
  const cardH = Math.round(cardW * 1.35);
  const arcWidth = W - sidePad * 2;
  const arcHeight = Math.round(arcWidth * 0.48);

  const filterId = "arcGlowFilter__pf";
  const gradId = "arcGrad__pf";

  const cards = Array.from({ length: cardCount });

  return (
    <section
      className="w-full"
      style={{
        background: `linear-gradient(180deg, ${bgTop} 0%, ${bgBottom} 100%)`,
        color: "white",
        padding: `${paddingY}px 0`,
      }}
    >
      <div className="mx-auto" style={{ width: "100%", maxWidth: W, padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 54, lineHeight: 1.25 }}>
            <div>{titleTop}</div>
            <div style={{ marginTop: 10 }}>{titleBottom}</div>
          </h2>
        </div>

        <svg
          width="100%"
          viewBox={`0 0 ${W} ${arcHeight + cardH + 120}`}
          role="img"
          aria-label="intro-arc"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={arcStartColor} />
              <stop offset="100%" stopColor={arcEndColor} />
            </linearGradient>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={arcGlow} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 아치 */}
          <g transform={`translate(${sidePad}, 0)`}>
            <path
              d={describeArc(arcWidth / 2, arcHeight + 12, arcWidth / 2, 200, -20)}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={arcStroke}
              filter={`url(#${filterId})`}
              opacity={0.95}
            />
          </g>

          {/* 카드 */}
          <g transform={`translate(${sidePad}, ${arcHeight - 14})`}>
            {cards.map((_, i) => {
              const x = i * (cardW + gap);
              const y = 64;
              return (
                <g key={i} transform={`translate(${x}, ${y})`}>
                  <rect x="0" y="0" rx={cardRadius} ry={cardRadius} width={cardW} height={cardH}
                        fill="none" stroke={cardStroke} strokeWidth="2" />
                  <rect x="0" y="0" rx={cardRadius} ry={cardRadius} width={cardW} height={cardH}
                        fill={cardFill} />
                  <ellipse cx={cardW / 2} cy={cardH} rx={cardW * 0.48} ry={18}
                           fill={cardGlow} opacity={0.65} />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}
function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angleInRadians), y: cy + r * Math.sin(angleInRadians) };
}
