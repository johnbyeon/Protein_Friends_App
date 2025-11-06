package com.my.back.repository;

import com.my.back.entity.BoardViewer;
import com.my.back.entity.BoardViewerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * BoardViewer Repository
 * - 게시글 조회수 관리
 */
public interface BoardViewerRepository extends JpaRepository<BoardViewer, BoardViewerId> {

    /**
     * 특정 게시글의 조회수 카운트
     * @param pId 게시글 ID
     * @return 조회수
     */
    @Query("SELECT COUNT(bv) FROM BoardViewer bv WHERE bv.pId = :pId")
    Long countByPId(@Param("pId") Long pId);

    /**
     * 특정 유저가 특정 게시글을 오늘 이미 조회했는지 확인
     * @param pId 게시글 ID
     * @param uId 유저 ID
     * @param startOfDay 오늘 시작 (00:00:00)
     * @param endOfDay 오늘 끝 (23:59:59)
     * @return 조회 기록이 있으면 true
     */
    @Query("""
        SELECT CASE WHEN COUNT(bv) > 0 THEN true ELSE false END
        FROM BoardViewer bv
        WHERE bv.pId = :pId
        AND bv.uId = :uId
        AND bv.date >= :startOfDay
        AND bv.date <= :endOfDay
    """)
    boolean existsByPIdAndUIdToday(
            @Param("pId") Long pId,
            @Param("uId") Long uId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );
}
