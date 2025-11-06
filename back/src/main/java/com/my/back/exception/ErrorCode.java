package com.my.back.exception;

import org.springframework.http.HttpStatus;

/**
 * API 에러 코드 정의
 * - HTTP 상태 코드 + 사용자 메시지 조합
 * - 도메인별로 확장 가능
 */
public enum ErrorCode {
    GYM_NOT_FOUND(HttpStatus.NOT_FOUND, "지점을 찾을 수 없습니다."),
    GYM_REVIEW_FORBIDDEN(HttpStatus.FORBIDDEN, "이용 이력이 있어야 리뷰를 작성할 수 있습니다."), // ✅ 400 → 403
    GYM_REVIEW_CONFLICT(HttpStatus.CONFLICT, "해당 지점에 이미 리뷰를 작성했습니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() { return status; }
    public String getMessage() { return message; }
}
