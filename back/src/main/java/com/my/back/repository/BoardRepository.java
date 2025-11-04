package com.my.back.repository;

import com.my.back.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Board Repository
 * - 게시글 조회 및 관리
 */
public interface BoardRepository extends JpaRepository<Board, Long> {

    /**
     * 게시글 타입별 조회 (노출되는 게시글만, 최신순 정렬)
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    @Query("SELECT b FROM Board b WHERE b.pTypeId = :pTypeId AND b.pSetVisible = true ORDER BY b.pCreateDate DESC")
    List<Board> findByPTypeIdAndVisible(@Param("pTypeId") Long pTypeId);

    /**
     * 게시글 타입별 조회 (모든 게시글, 관리자용)
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    @Query("SELECT b FROM Board b WHERE b.pTypeId = :pTypeId ORDER BY b.pCreateDate DESC")
    List<Board> findByPTypeId(@Param("pTypeId") Long pTypeId);

    /**
     * 게시글 타입별 조회 (모든 게시글 포함, 최신순 정렬) - 관리자용
     * @param pTypeId 게시글 타입 ID
     * @return 게시글 목록
     */
    @Query("SELECT b FROM Board b WHERE b.pTypeId = :pTypeId ORDER BY b.pCreateDate DESC")
    List<Board> findByPTypeIdOrderByPCreateDateDesc(@Param("pTypeId") Long pTypeId);

    /**
     * 게시글 ID로 조회 (노출되는 게시글만)
     * @param pId 게시글 ID
     * @return 게시글
     */
    @Query("SELECT b FROM Board b WHERE b.pId = :pId AND b.pSetVisible = true")
    Optional<Board> findByIdAndVisible(@Param("pId") Long pId);

    /**
     * 팝업 게시글 조회 (현재 날짜 기준 활성 팝업)
     * - pIsPopup = true
     * - pSetVisible = true
     * - isAlwaysPopup = true OR (현재 날짜가 pPopupStartDate ~ pPopupEndDate 사이)
     * @return 팝업 게시글 목록
     */
    @Query("""
        SELECT b FROM Board b
        WHERE b.pIsPopup = true
        AND b.pSetVisible = true
        AND (
            b.isAlwaysPopup = true
            OR (
                b.pPopupStartDate <= CURRENT_DATE
                AND b.pPopupEndDate >= CURRENT_DATE
            )
            OR b.isUnlimited = true
        )
        ORDER BY b.pCreateDate DESC
    """)
    List<Board> findActivePopups();

    /**
     * 전체 게시글 조회 (노출되는 게시글만, 최신순)
     * @return 게시글 목록
     */
    @Query("SELECT b FROM Board b WHERE b.pSetVisible = true ORDER BY b.pCreateDate DESC")
    List<Board> findAllVisible();

    /**
     * 트레이너별 게시글 조회
     * @param tId 트레이너 ID
     * @return 게시글 목록
     */
    @Query("SELECT b FROM Board b WHERE b.tId = :tId AND b.pSetVisible = true ORDER BY b.pCreateDate DESC")
    List<Board> findByTrainerId(@Param("tId") Long tId);
}
