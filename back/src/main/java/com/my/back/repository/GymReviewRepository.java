package com.my.back.repository;

import com.my.back.entity.GymReview;
import com.my.back.entity.GymReviewId;
import com.my.back.repository.projection.GymReviewView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GymReviewRepository extends JpaRepository<GymReview, GymReviewId> {

    /** 특정 지점에 특정 유저가 리뷰를 남겼는지 확인 */
    @Query("""
        select case when count(r) > 0 then true else false end
        from GymReview r
        where r.gId = :gId and r.uId = :uId
    """)
    boolean existsReview(@Param("gId") Long gId, @Param("uId") Long uId);

    /** 지점 리뷰 목록 조회 */
    @Query("""
        select new com.my.back.repository.projection.GymReviewView(
            r.uId,
            coalesce(u.name, u.email),
            r.gRating,
            r.gReview,
            r.createdAt
        )
        from GymReview r
        join Users u on r.uId = u.uId
        where r.gId = :gId
        order by r.createdAt desc
    """)
    Page<GymReviewView> findReviewsByGymId(@Param("gId") Long gId, Pageable pageable);

    /** 지점 평균 별점 조회 */
    @Query("select avg(r.gRating) from GymReview r where r.gId = :gId")
    Double getAverageRating(@Param("gId") Long gId);

    /** 지점 리뷰 총 개수 조회 */
    @Query("SELECT COUNT(r) FROM GymReview r WHERE r.gId = :gId")
    Long countByGId(@Param("gId") Long gId);
}
