import React, { useState } from "react";

export default function AddProduct() {
  const [images, setImages] = useState([
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDCveBL2GTTXN5Au1_KBdnnans0RSReScUO87683xmhXbKe7pIyflt51cyBBLj6ynIEU0-u2bZMcgXacUfacSUidHVIJNawO8r4UjkK62rqbdV_cmRXVQrBh-hJ5yK9e9RQlZFcGYo8YbeRGyPI9FRiSv3h_kaYnHaxLOfEoqXBUayo85AN28cFxrFCgNv0Xot8xb96K-8onkbF9ikmODUpgXXuoTziQ5gMy3IP6YhAPdZeWBXAhHmVGAJ8pptMLHpvfa76QXM8qr8",
  ]);
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () =>
    setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 font-display">
      <div className="w-full max-w-4xl rounded-xl bg-background-light dark:bg-background-dark shadow-2xl">
        <div className="flex flex-col gap-6 p-8">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              상품 추가
            </h2>
            <button className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* 메인 입력 폼 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 이미지 업로드 */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                상품 이미지 (최대 10장)
              </label>
              <div className="relative h-64 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800">
                {images.length > 0 && (
                  <img
                    src={images[currentImage]}
                    alt="Product"
                    className="h-full w-full rounded-lg object-cover"
                  />
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-primary"
                    >
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-primary"
                    >
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                  </>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i === currentImage ? "bg-white" : "bg-white/50"
                      }`}
                    ></div>
                  ))}
                </div>
                <button className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-primary">
                  <span className="material-symbols-outlined text-base">
                    close
                  </span>
                </button>
              </div>

              {/* 썸네일 + 업로드 */}
              <div className="flex items-center gap-2">
                <div className="grid flex-grow grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative h-16 w-16 cursor-pointer rounded-lg ${
                        i === currentImage
                          ? "border-2 border-primary"
                          : "border border-transparent"
                      } bg-neutral-200 dark:bg-neutral-700`}
                      onClick={() => setCurrentImage(i)}
                    >
                      <img
                        src={img}
                        alt="Thumbnail"
                        className="h-full w-full rounded-md object-cover"
                      />
                    </div>
                  ))}
                </div>
                <label
                  htmlFor="image-upload"
                  className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                >
                  <span className="material-symbols-outlined text-2xl text-neutral-400">
                    add_photo_alternate
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    추가
                  </span>
                  <input id="image-upload" type="file" className="hidden" />
                </label>
              </div>
            </div>

            {/* 오른쪽 상품 정보 */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-name"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    상품 이름
                  </label>
                  <input
                    id="product-name"
                    placeholder="상품 이름 입력"
                    type="text"
                    className="mt-1 block w-full rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="product-code"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    상품 코드
                  </label>
                  <input
                    id="product-code"
                    placeholder="상품 코드 입력"
                    type="text"
                    className="mt-1 block w-full rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="regular-price"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    상품 정상가
                  </label>
                  <input
                    id="regular-price"
                    type="number"
                    placeholder="정상가 입력"
                    className="mt-1 block w-full rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sale-price"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    상품 할인가
                  </label>
                  <input
                    id="sale-price"
                    type="number"
                    placeholder="할인가 입력"
                    className="mt-1 block w-full rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-status"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    상품 상태
                  </label>
                  <select
                    id="product-status"
                    className="mt-1 block w-full appearance-none rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                  >
                    <option>판매중</option>
                    <option>품절</option>
                    <option>숨김</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="stock-quantity"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    재고 수량
                  </label>
                  <input
                    id="stock-quantity"
                    type="number"
                    placeholder="재고 수량 입력"
                    className="mt-1 block w-full rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 제목 입력 */}
          <div>
            <label
              htmlFor="product-title"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              제목
            </label>
            <input
              id="product-title"
              placeholder="제목을 입력하세요"
              type="text"
              className="mt-1 block w-full rounded-lg border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white"
            />
          </div>

          {/* 본문 입력 */}
          <div>
            <label
              htmlFor="product-description"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              상품 본문
            </label>
            <div className="mt-1 rounded-lg border border-neutral-300 bg-neutral-50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex flex-wrap items-center space-x-1 border-b border-neutral-300 p-2 dark:border-neutral-700">
                {[
                  "format_bold",
                  "format_italic",
                  "format_underlined",
                  "strikethrough_s",
                  "format_size",
                  "format_color_text",
                  "format_color_fill",
                  "format_align_left",
                  "format_align_center",
                  "format_align_right",
                  "format_list_bulleted",
                  "format_list_numbered",
                  "undo",
                ].map((icon) => (
                  <button
                    key={icon}
                    className="rounded p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {icon}
                    </span>
                  </button>
                ))}
              </div>
              <textarea
                id="product-description"
                placeholder="상품에 대한 설명을 입력하세요..."
                rows="10"
                className="block w-full resize-none border-0 bg-transparent p-3 text-sm focus:ring-0 dark:text-white"
              ></textarea>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-4">
            <button className="rounded-lg bg-neutral-200 px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">
              취소
            </button>
            <button className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/80">
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
