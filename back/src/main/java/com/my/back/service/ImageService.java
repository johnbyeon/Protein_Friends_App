package com.my.back.service;

import com.my.back.entity.Image;
import com.my.back.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final ImageRepository imageRepository;

    /**
     * 이미지 메타데이터 저장
     */
    @Transactional
    public Image saveImage(String s3Key, String originalFilename, String contentType,
                           Long fileSize, Long userId, String description, String imageType) {
        Image image = Image.builder()
                .s3Key(s3Key)
                .originalFilename(originalFilename)
                .contentType(contentType)
                .fileSize(fileSize)
                .userId(userId)
                .description(description)
                .imageType(imageType)
                .deleted(false)
                .build();

        return imageRepository.save(image);
    }

    /**
     * S3 키로 이미지 조회
     */
    public Image getImageByKey(String s3Key) {
        return imageRepository.findByS3Key(s3Key)
                .orElseThrow(() -> new IllegalArgumentException("이미지를 찾을 수 없습니다: " + s3Key));
    }

    /**
     * 사용자의 이미지 목록 조회
     */
    public List<Image> getUserImages(Long userId) {
        return imageRepository.findByUserIdAndDeletedFalseOrderByUploadedAtDesc(userId);
    }

    /**
     * 이미지 삭제 (soft delete)
     */
    @Transactional
    public void deleteImage(Long imageId, Long userId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("이미지를 찾을 수 없습니다"));

        // 본인 이미지만 삭제 가능
        if (!image.getUserId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다");
        }

        image.setDeleted(true);
        imageRepository.save(image);
    }
}
