package com.my.back.repository;

import com.my.back.entity.ClassUserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * PT 클래스 예약 정보 Repository
 * - 수업 예약 / 취소 / 예약자 조회 / 중복예약 체크
 */
public interface ClassUserInfoRepository extends JpaRepository<ClassUserInfo, Long> {

    /**
     * 특정 클래스의 총 예약 인원 수 조회
     * - 현재 예약 현황 확인용
     */
    @Query("SELECT COUNT(c) FROM ClassUserInfo c WHERE c.ptClassInfo.ptClassId = :classId")
    long countByClassId(@Param("classId") Long classId);

    /**
     * 해당 유저가 이미 해당 클래스 예약했는지 확인
     * - 중복 예약 방지
     */
    @Query("""
            SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END 
            FROM ClassUserInfo c 
            WHERE c.ptClassInfo.ptClassId = :classId 
              AND c.users.uId = :userId
            """)
    boolean existsByClassIdAndUserId(@Param("classId") Long classId, @Param("userId") Long userId);

    /**
     * 예약자 목록 조회 (유저 정보 포함)
     * - 관리자 화면에서 수업 상세보기 시 사용
     */
    @Query("""
            SELECT c 
            FROM ClassUserInfo c 
            JOIN FETCH c.users 
            WHERE c.ptClassInfo.ptClassId = :classId 
            ORDER BY c.datetime ASC
            """)
    List<ClassUserInfo> findByClassId(@Param("classId") Long classId);

    /**
     * 클래스 예약 생성 (Native)
     * - 성능 / deadlock 회피 목적
     * - 엔티티 save 대신 DB insert 직접 수행
     */
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO class_user_info (pt_class_id, u_id, datetime) VALUES (:classId, :userId, :datetime)", nativeQuery = true)
    void insertBooking(@Param("classId") Long classId,
                       @Param("userId") Long userId,
                       @Param("datetime") LocalDateTime datetime);

    /**
     * 예약 취소 (기존 값 삭제)
     * - 취소 시 PT 복구 로직과 함께 사용
     */
    @Modifying(clearAutomatically = true)
    @Query("""
            DELETE FROM ClassUserInfo c 
            WHERE c.ptClassInfo.ptClassId = :classId 
              AND c.users.uId = :userId
            """)
    int deleteByClassIdAndUserId(@Param("classId") Long classId, @Param("userId") Long userId);

    @Query("""
        select cu
        from ClassUserInfo cu
        where cu.users.uId = :userId
        order by cu.datetime desc
        """)
    List<ClassUserInfo> findByUserId(Long userId);

}
