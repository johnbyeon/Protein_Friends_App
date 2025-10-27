package com.my.back.myjwt;

/**
 * ✅ JWT 세션 만료 시간 단위 상수 정의
 * - 다른 클래스(JWTUtil, LoginFilter, OAuth2SuccessHandler 등)에서 쉽게 참조 가능
 */
public interface SessionTime {

    /** 1 밀리초 */
    long MS = 1L;

    /** 1초 = 1000밀리초 */
    long SECOND = 1000L * MS;

    /** 1분 = 60초 */
    long MINUTE = 60L * SECOND;

    /** 1시간 = 60분 */
    long HOUR = 60L * MINUTE;

    /** 1일 = 24시간 */
    long DAY = 24L * HOUR;
}
