package com.my.back.entity;

/**
 * 할인 타입 Enum
 *
 * PT_DISCOUNT(PT 할인), PRODUCT_DISCOUNT(상품 할인), MEMBERSHIP_DISCOUNT(이용권 할인)
 */
public enum DiscountType {

    /** PT 할인 */
    PT_DISCOUNT, // PT 할인

    /** 상품 할인 */
    PRODUCT_DISCOUNT, // 상품 할인

    /** 이용권 할인 */
    MEMBERSHIP_DISCOUNT // 이용권 할인
}
