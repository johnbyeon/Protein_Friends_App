package com.my.back.repository;

import com.my.back.entity.PtInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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

    /**
     * 현재 사용 가능한 PT 이용권 목록 조회 (만료 임박 PT 먼저)
     * - Status = true (사용 가능 상태)
     * - 클래스 예약 시 사용
     */
    @Query("""
            select p from PtInfo p
            where p.uId = :uId
              and p.tId = :tId
              and p.status = true
            order by p.endDate asc
            """)
    List<PtInfo> findAvailableTickets(@Param("uId") Long uId, @Param("tId") Long tId);

    /**
     * PT 전체 이력 조회 (최근순)
     * - 관리자 / 마이페이지 이력 화면
     */
    @Query("""
            select p from PtInfo p
            where p.uId = :uId
              and p.tId = :tId
            order by p.endDate desc
            """)
    List<PtInfo> findTicketsForRestore(@Param("uId") Long uId, @Param("tId") Long tId);

    /**
     * 사용자의 모든 활성 PT 이용권 조회
     * - 마이페이지 PT 이용권 목록
     */
    @Query(value = "SELECT * FROM pt_info WHERE u_id = :userId AND status = true", nativeQuery = true)
    List<PtInfo> findByUsers_UIdAndStatusTrue(@Param("userId") Long userId);
}
