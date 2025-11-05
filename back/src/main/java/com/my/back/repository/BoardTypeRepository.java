package com.my.back.repository;

import com.my.back.entity.BoardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * BoardType Repository
 */
public interface BoardTypeRepository extends JpaRepository<BoardType, Long> {
    /**
     * URL 주소 이름으로 게시글 타입 조회
     * 예: "notices", "events"
     */
    @Query("SELECT b FROM BoardType b WHERE b.pTypeAddressName = :addressName")
    Optional<BoardType> findByPTypeAddressName(@Param("addressName") String addressName);

    /**
     * 게시글 타입 이름으로 조회
     * 예: "공지사항", "이벤트"
     */
    @Query("SELECT b FROM BoardType b WHERE b.pTypeName = :typeName")
    Optional<BoardType> findByPTypeName(@Param("typeName") String typeName);

    /**
     * URL 주소 이름 중복 체크
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BoardType b WHERE b.pTypeAddressName = :addressName")
    boolean existsByPTypeAddressName(@Param("addressName") String addressName);

    /**
     * displayOrder 기준으로 정렬하여 모든 게시글 타입 조회
     */
    @Query("SELECT b FROM BoardType b ORDER BY b.displayOrder ASC, b.pTypeId ASC")
    List<BoardType> findAllOrderByDisplayOrder();
}
