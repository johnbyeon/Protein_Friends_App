// src/utils/maskUtils.js

/**
 * 상단 feathered mask
 * 카드 위쪽이 자연스럽게 사라지도록 하는 마스크
 */
export function maskTopUltra(feather = 90) {
  const h = Math.max(40, feather);
  return {
    position: "relative",
    overflow: "hidden",
    WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, black ${h}px)`,
    maskImage: `linear-gradient(to bottom, transparent 0px, black ${h}px)`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}

/**
 * 하단 feathered mask
 * 히어로 이미지 / B3 배경 하단을 자연스럽게 어둡게 사라지게 하는 마스크
 */
export function maskBottomUltra(feather = 170) {
  const h = Math.max(60, feather);
  return {
    WebkitMaskImage: `linear-gradient(to bottom, black 0px, black calc(100% - ${h}px), transparent 100%)`,
    maskImage: `linear-gradient(to bottom, black 0px, black calc(100% - ${h}px), transparent 100%)`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}
