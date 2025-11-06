// src/components/FeatherBridge.jsx
import React from "react";

export default function FeatherBridge({ height = 200, opacity = 0.32, blur = 7 }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -1,
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
