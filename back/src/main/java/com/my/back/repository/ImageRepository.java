package com.my.back.repository;

import com.my.back.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    /** S3 키로 이미지 조회 */
    Optional<Image> findByS3Key(String s3Key);

    /** 사용자 ID로 이미지 목록 조회 */
    List<Image> findByUserIdAndDeletedFalseOrderByUploadedAtDesc(Long userId);

    /** 사용자의 삭제되지 않은 이미지 개수 */
    long countByUserIdAndDeletedFalse(Long userId);
}
