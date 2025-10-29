# ===== Build assets =====
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./

# ✅ 반드시 devDependencies 포함해서 설치
ENV NODE_ENV=development
RUN npm ci

COPY . .

# ✅ 실패 시 바로 중단 (|| 제거)
RUN npm run build

# ===== Nginx serve =====
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]