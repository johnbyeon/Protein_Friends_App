package com.my.back.repository;

import com.my.back.entity.PtInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * PT 이용 기록 Repository
 * - PT를 받은 적 있는지 확인
 */
public interface PtInfoRepository extends JpaRepository<PtInfo, Long> {

    /**
     * 해당 유저가 해당 지점 트레이너에게 PT 받은 기록 있는가?
     * - 리뷰 작성 자격 체크
     */
    @Query("""
            select (count(p) > 0)
            from PtInfo p
            join p.trainer t
            join t.gymInfo g
            where p.uId = :userId
              and g.gId = :gId
            """)
    boolean hasUsageHistory(@Param("userId") Long userId, @Param("gId") Long gId);
}
