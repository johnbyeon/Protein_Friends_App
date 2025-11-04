package com.my.back.repository;

import com.my.back.entity.MembershipLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 기간제 회원권 기록 Repository
 * - 특정 지점에서 회원권 사용했는지 검사
 */
public interface MembershipLogRepository extends JpaRepository<MembershipLog, Long> {

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
}
