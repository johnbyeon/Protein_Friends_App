package com.my.back.exception;

import org.springframework.http.HttpStatus;

/**
 * API 에러 코드 정의
 * - HTTP 상태 코드 + 사용자 메시지 조합
 */
public enum ErrorCode {

    // ===== 공통 =====
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),

    // ===== 헬스장 =====
    GYM_NOT_FOUND(HttpStatus.NOT_FOUND, "지점을 찾을 수 없습니다."),
    GYM_REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."),
    GYM_REVIEW_FORBIDDEN(HttpStatus.FORBIDDEN, "이용 이력이 있어야 리뷰를 작성할 수 있습니다."),
    GYM_REVIEW_CONFLICT(HttpStatus.CONFLICT, "해당 지점에 이미 리뷰를 작성했습니다."),

    // ===== PT 클래스 관리 =====
    PT_CLASS_NOT_FOUND(HttpStatus.NOT_FOUND, "클래스를 찾을 수 없습니다."),
    TRAINER_NOT_FOUND(HttpStatus.NOT_FOUND, "트레이너 정보를 찾을 수 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."),
    PT_CLASS_ALREADY_STARTED(HttpStatus.BAD_REQUEST, "이미 시작한 클래스는 수정할 수 없습니다."),
    PT_CLASS_ALREADY_ENDED(HttpStatus.BAD_REQUEST, "종료된 클래스에는 예약할 수 없습니다."),
    PT_CLASS_FULL(HttpStatus.BAD_REQUEST, "정원이 가득 찼습니다."),
    PT_CLASS_ALREADY_RESERVED(HttpStatus.CONFLICT, "이미 예약된 회원입니다."),
    PT_CLASS_RESERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "예약 정보를 찾을 수 없습니다."),
    INSUFFICIENT_PT_COUNT(HttpStatus.BAD_REQUEST, "남은 PT 횟수가 부족합니다."),
    PT_TICKET_NOT_FOUND(HttpStatus.BAD_REQUEST, "사용 가능한 PT 이용권이 없습니다."),
    PT_TICKET_RESTORE_NOT_FOUND(HttpStatus.BAD_REQUEST, "복구할 PT 이용권 정보를 찾을 수 없습니다."),
    MEMBERSHIP_NOT_FOUND(HttpStatus.NOT_FOUND, "회원권 상품을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() { return status; }
    public String getMessage() { return message; }
}
