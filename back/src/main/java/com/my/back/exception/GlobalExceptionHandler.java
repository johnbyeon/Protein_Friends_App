package com.my.back.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 전역 예외 처리 핸들러
 * - ApiException: 비즈니스 예외 처리
 * - MethodArgumentNotValidException: DTO 검증 실패 처리
 * - Exception: 예상 못한 서버 오류 처리
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 비즈니스 예외 처리 */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();

        log.warn("[API ERROR] {} - {}", errorCode.name(), ex.getMessage());

        ErrorResponse body = ErrorResponse.of(errorCode, request.getRequestURI());
        return ResponseEntity.status(errorCode.getStatus()).body(body);
    }

    /** DTO validation 실패 처리 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        log.warn("[VALIDATION ERROR] {}", message);

        ErrorResponse body = ErrorResponse.of(
                ErrorCode.INVALID_REQUEST.getStatus().value(),
                ErrorCode.INVALID_REQUEST.getStatus().getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.getStatus()).body(body);
    }

    /** 예상 못한 모든 오류 처리 (서버 오류) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpServletRequest request) {

        log.error("[UNEXPECTED ERROR]", ex); // ✅ 로그 추가

        ErrorResponse body = ErrorResponse.of(
                500,
                "Internal Server Error",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(500).body(body);
    }
}
