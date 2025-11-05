package com.my.back.exception;

import java.time.LocalDateTime;

/**
 * 예외 응답 DTO
 * - 응답 시간 / 상태코드 / 에러명 / 메시지 / 요청 경로 포함
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
    public static ErrorResponse of(ErrorCode errorCode, String path) {
        return new ErrorResponse(
                LocalDateTime.now(),
                errorCode.getStatus().value(),
                errorCode.getStatus().getReasonPhrase(),
                errorCode.getMessage(),
                path
        );
    }

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(LocalDateTime.now(), status, error, message, path);
    }
}
