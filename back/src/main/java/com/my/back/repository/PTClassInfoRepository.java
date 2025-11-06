package com.my.back.repository;

import com.my.back.entity.PTClassInfo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 * 관리자 PT 클래스 Repository
 * - 클래스 스케줄 및 상세 정보 조회
 * - 트레이너 정보와 함께 로딩 (N+1 방지)
 */
public interface PTClassInfoRepository extends JpaRepository<PTClassInfo, Long> {

    /**
     * 모든 PT 클래스 목록 조회 (시작일시 순)
     * - 트레이너 정보 즉시 로딩 (EntityGraph)
     * - 관리자 시간표 화면에서 사용
     */
    @EntityGraph(attributePaths = "trainer")
    List<PTClassInfo> findAllByOrderByStartDatetimeAsc();

    /**
     * 특정 클래스 상세 조회 + 트레이너 정보 로딩
     * - 수업 상세 페이지 사용
     */
    @EntityGraph(attributePaths = "trainer")
    Optional<PTClassInfo> findWithTrainerByPtClassId(Long ptClassId);

    @Query("""
        select c
        from PTClassInfo c
        where c.endDatetime > current_timestamp
        order by c.startDatetime asc
        """)
    List<PTClassInfo> findAvailableClasses();

}
