// src/main/java/com/my/back/repository/PaymentLogRepository.java
package com.my.back.repository;

import com.my.back.entity.PaymentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * ===============================================================
 * ✅ PaymentLogRepository
 * ---------------------------------------------------------------
 * 🔹 결제 이력(PaymentLog) 엔티티용 JPA 리포지토리
 * 🔹 주요 기능:
 *   - 결제 로그 저장, 조회, 삭제 등 기본 CRUD 자동 제공
 *   - 주문번호(orderId)로 결제 로그 단건 조회
 * ===============================================================
 */
@Repository
public interface PaymentLogRepository extends JpaRepository<PaymentLog, String> {

    /**
     * ✅ 주문번호로 결제 로그 단건 조회
     * @param orderId 주문 고유번호
     * @return 해당 주문의 PaymentLog 엔티티 (없으면 null)
     */
    PaymentLog findByOrderId(String orderId);
}
