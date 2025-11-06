package com.my.back.controller;

import com.my.back.dto.CustomUserDetails;
import com.my.back.dto.UploadUrlRequest;
import com.my.back.dto.UploadUrlResponse;
import com.my.back.dto.UserDTO;
import com.my.back.entity.Image;
import com.my.back.service.ImageService;
import com.my.back.service.S3PresignService;
import com.my.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/s3")
public class S3Controller {

    private final S3PresignService s3Service;
    private final ImageService imageService;
    private final UserService userService;

    private static final String BUCKET_NAME = "protein-friends-s3";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    /**
     * S3 업로드 URL 발급 + DB 메타데이터 저장
     * 인증 필수, 이미지만, 10MB 이하
     */
    @PostMapping("/upload")
    public ResponseEntity<?> getUploadUrl(
            @RequestBody UploadUrlRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            // 1. 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다");
            }

            // 2. 이메일로 사용자 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("사용자를 찾을 수 없습니다");
            }

            Long userId = user.getUId();

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("사용자 ID를 가져올 수 없습니다");
            }

            // 2. 파일 타입 검증 (이미지만)
            if (!ALLOWED_IMAGE_TYPES.contains(request.getContentType())) {
                return ResponseEntity.badRequest()
                        .body("이미지 파일만 업로드 가능합니다 (JPEG, PNG, WEBP)");
            }

            // 3. 파일 크기 검증 (10MB)
            if (request.getContentLength() == null || request.getContentLength() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                        .body("파일 크기는 10MB 이하만 가능합니다");
            }

            // 4. 고유한 파일명 생성 (UUID + 원본 파일명)
            String uniqueFilename = UUID.randomUUID() + "_" + request.getFilename();

            // 5. 사용자별 폴더 구조
            String s3Key = "uploads/" + userId + "/" + uniqueFilename;

            // 6. Presigned PUT URL 발급
            String putUrl = s3Service.getUploadUrl(BUCKET_NAME, s3Key, request.getContentType());

            // 7. DB에 메타데이터 저장
            Image savedImage = imageService.saveImage(
                    s3Key,
                    request.getFilename(),
                    request.getContentType(),
                    request.getContentLength(),
                    userId,
                    request.getDescription(),
                    request.getImageType()
            );

            // 8. 응답
            UploadUrlResponse response = new UploadUrlResponse(
                    s3Key,
                    putUrl,
                    savedImage.getImageId()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("업로드 URL 발급 실패: " + e.getMessage());
        }
    }

    /**
     * S3 다운로드 URL 발급
     * 본인이 업로드한 이미지만 조회 가능
     * 이미지 타입에 따라 만료 시간 차등 적용
     */
    @GetMapping("/download")
    public ResponseEntity<?> getDownloadUrl(
            @RequestParam String key,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            // 1. 인증 확인
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다");
            }

            // 2. 이메일로 사용자 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("사용자를 찾을 수 없습니다");
            }

            // 3. DB에서 이미지 확인
            Image image = imageService.getImageByKey(key);

            // 4. 권한 확인 (본인 이미지만)
            if (!image.getUserId().equals(user.getUId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("접근 권한이 없습니다");
            }

            // 4. 이미지 타입별 만료 시간 설정
            java.time.Duration expiration = getExpirationByImageType(image.getImageType());

            // 5. Presigned GET URL 발급
            String url = s3Service.getDownloadUrl(BUCKET_NAME, key, expiration);

            return ResponseEntity.ok(url);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("다운로드 URL 발급 실패: " + e.getMessage());
        }
    }

    /**
     * 이미지 타입에 따른 URL 만료 시간 결정
     */
    private java.time.Duration getExpirationByImageType(String imageType) {
        if (imageType == null) {
            return java.time.Duration.ofHours(1); // 기본 1시간
        }

        switch (imageType.toUpperCase()) {
            case "PROFILE":
                return java.time.Duration.ofDays(7); // 프로필: 7일 (자주 안 바뀜)
            case "MEAL":
                return java.time.Duration.ofHours(24); // 식단: 24시간
            case "INBODY":
                return java.time.Duration.ofMinutes(30); // 인바디: 30분 (민감)
            case "EXERCISE":
                return java.time.Duration.ofHours(12); // 운동: 12시간
            default:
                return java.time.Duration.ofHours(1); // 기타: 1시간
        }
    }

    /**
     * 내 이미지 목록 조회
     */
    @GetMapping("/my-images")
    public ResponseEntity<?> getMyImages(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다");
            }

            // 이메일로 사용자 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("사용자를 찾을 수 없습니다");
            }

            List<Image> images = imageService.getUserImages(user.getUId());
            return ResponseEntity.ok(images);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이미지 목록 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 이미지 삭제
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다");
            }

            // 이메일로 사용자 조회
            String email = userDetails.getUsername();
            UserDTO user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("사용자를 찾을 수 없습니다");
            }

            imageService.deleteImage(imageId, user.getUId());
            return ResponseEntity.ok("이미지가 삭제되었습니다");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("이미지 삭제 실패: " + e.getMessage());
        }
    }
}
