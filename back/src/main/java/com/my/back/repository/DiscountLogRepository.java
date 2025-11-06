// src/main/java/com/my/back/repository/DiscountLogRepository.java
package com.my.back.repository;

import com.my.back.entity.DiscountLog;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 할인권 로그 Repository
 * - 회원이 보유한 할인권 내역 조회 + 결제 시 사용처리
 */
@Repository
public interface DiscountLogRepository extends JpaRepository<DiscountLog, Long> {

    // ====== 기존 메서드(유지: 다른 코드 깨짐 방지) ======
    /** 회원 고유번호(u_id)로 전체 할인권 조회 (N+1 방지) */
    @EntityGraph(attributePaths = {"discountService"})
    List<DiscountLog> findByUsers_uId(Long uId);

    /**
     * (기존 길던 JPQL) 특정 보유쿠폰 단건 + 기본 유효성 체크
     * ※ 새 로직으로 대체 예정 — 남겨두되 사용은 지양
     */
    @Deprecated
    @Query("""
           SELECT dl
           FROM DiscountLog dl
             JOIN FETCH dl.discountService ds
           WHERE dl.users.uId = :uId
             AND dl.recDisId  = :recDisId
             AND (dl.isUsed = false OR dl.isUsed IS NULL)
             AND (ds.isActive = true OR ds.isActive IS NULL)
             AND (ds.disStartDate IS NULL OR ds.disStartDate <= CURRENT_TIMESTAMP)
             AND (ds.disEndDate   IS NULL OR ds.disEndDate   >= CURRENT_TIMESTAMP)
           """)
    Optional<DiscountLog> findOwned(@Param("uId") Long uId,
                                    @Param("recDisId") Long recDisId);

    // ====== 새 메서드(서비스에서 타입/기간/최소금액 검증) ======
    /** 내 미사용 쿠폰 전체 (DiscountService 즉시로딩) */
    @EntityGraph(attributePaths = "discountService")
    List<DiscountLog> findByUsers_uIdAndIsUsedFalse(Long uId);

    /** 내 보유 쿠폰 단건 조회(유효성은 서비스에서 판단) */
    @EntityGraph(attributePaths = "discountService")
    Optional<DiscountLog> findByUsers_uIdAndRecDisId(Long uId, Long recDisId);

    /** 결제 성공 시 사용 처리(중복 사용 방지) */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
           update DiscountLog dl
              set dl.isUsed = true, dl.usedDate = CURRENT_TIMESTAMP
            where dl.users.uId = :uId
              and dl.recDisId  = :recDisId
              and (dl.isUsed = false or dl.isUsed is null)
           """)
    int markUsed(@Param("uId") Long uId, @Param("recDisId") Long recDisId);
}
