# ===== Build assets =====
FROM node:20-alpine AS build
WORKDIR /app

# --- 환경 변수 전달 (빌드 타임 변수용 ARG 선언) ---
ARG VITE_API_BASE
ARG VITE_BACKEND_ORIGIN

# --- 환경 변수 주입 (Vite 빌드 시 사용 가능) ---
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_BACKEND_ORIGIN=$VITE_BACKEND_ORIGIN

# --- 패키지 설치 ---
COPY package*.json ./
ENV NODE_ENV=development
RUN npm ci

# --- 소스 복사 후 빌드 ---
COPY . .
RUN npm run build

# ===== Nginx serve =====
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# --- 빌드된 파일 복사 ---
COPY --from=build /app/dist ./

# --- nginx 설정 복사 (있다면) ---
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]