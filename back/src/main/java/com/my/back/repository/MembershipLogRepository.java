package com.my.back.repository;

import com.my.back.entity.MembershipLog;
import com.my.back.entity.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * ===============================================================
 * ✅ MembershipLogRepository
 * ===============================================================
 * 🔹 역할
 *  - 회원의 전체 회원권 로그 또는 상태별 회원권 조회
 * ---------------------------------------------------------------
 * 🔹 주요 메서드
 *  - findAllByUsers_UIdOrderByCreateDateDesc(Long userId)
 *  - findAllByUsers_UIdAndStatusOrderByCreateDateDesc(Long userId, MembershipStatus status)
 * ===============================================================
 */
@Repository
public interface MembershipLogRepository extends JpaRepository<MembershipLog, Long> {

    /** 회원의 전체 회원권 목록 조회 (최신순) */
    List<MembershipLog> findAllByUsers_uIdOrderByCreateDateDesc(Long userId);

    /** 회원의 상태별 회원권 목록 조회 (예: ACTIVE, EXPIRED 등) */
    List<MembershipLog> findAllByUsers_uIdAndStatusOrderByCreateDateDesc(Long userId, MembershipStatus status);


    /**
     * 해당 유저가 해당 지점의 트레이너에게 회원권 이용 기록이 있는가?
     * - 리뷰 작성 자격 체크용
     */
    @Query("""
            select (count(ml) > 0)
            from MembershipLog ml
            join ml.trainer t
            join t.gymInfo g
            where ml.users.uId = :userId
              and g.gId = :gId
            """)
    boolean hasUsageHistory(@Param("userId") Long userId, @Param("gId") Long gId);

    /**
     * 회원권 로그와 membership_service를 조인해서 이미지 URL 포함 조회
     */
    @Query("""
            select ml
            from MembershipLog ml
            left join fetch ml.membershipService
            where ml.users.uId = :userId
            order by ml.createDate desc
            """)
    List<MembershipLog> findAllWithImageByUserId(@Param("userId") Long userId);

    /**
     * 회원권 로그와 membership_service를 조인해서 상태별 이미지 URL 포함 조회
     */
    @Query("""
            select ml
            from MembershipLog ml
            left join fetch ml.membershipService
            where ml.users.uId = :userId
              and ml.status = :status
            order by ml.createDate desc
            """)
    List<MembershipLog> findAllWithImageByUserIdAndStatus(@Param("userId") Long userId, @Param("status") MembershipStatus status);
}
