# ===== Build stage =====
FROM amazoncorretto:17.0.12 AS build
WORKDIR /app

# 소스 복사
COPY . .

# Gradle 데몬 비활성화 + StackTrace 활성화
# ⬇️ 빌드 중 로그가 끊기지 않게 --stacktrace 추가
RUN chmod +x ./gradlew
RUN ./gradlew clean bootJar --no-daemon --stacktrace

# ===== Run stage =====
FROM amazoncorretto:17.0.12
WORKDIR /app

# build stage 결과 JAR 복사
COPY --from=build /app/build/libs/*.jar /app/server.jar

# 포트 노출
EXPOSE 8080

# 환경변수 (prod, local 등 주입 가능)
ENV SPRING_PROFILES_ACTIVE=local

# 실행 커맨드
CMD ["java", "-jar", "/app/server.jar"]