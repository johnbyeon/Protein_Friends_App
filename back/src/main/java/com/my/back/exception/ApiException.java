package com.my.back.exception;

/**
 * 커스텀 예외 클래스
 * - ErrorCode 기반으로 API 오류 처리
 * - RuntimeException 상속 → 트랜잭션 롤백 가능
 */
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode) {
        super(errorCode.getMessage()); // 부모 메시지 설정
        this.errorCode = errorCode;
    }

    public ApiException(ErrorCode errorCode, String message) {
        super(message); // 커스텀 메시지
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
