package com.my.back.util;

/**
 * S3 관련 유틸리티 클래스
 */
public class S3Util {

    /**
     * S3 Presigned URL 또는 일반 URL에서 S3 Key 추출
     *
     * 예시:
     * - https://protein-friends-s3.s3.ap-northeast-2.amazonaws.com/uploads/123/uuid_file.jpg?X-Amz-...
     *   → uploads/123/uuid_file.jpg
     * - https://protein-friends-s3.s3.amazonaws.com/uploads/456/test.png
     *   → uploads/456/test.png
     * - uploads/789/image.jpg
     *   → uploads/789/image.jpg (이미 Key 형태)
     *
     * @param urlOrKey S3 URL 또는 Key
     * @return S3 Key
     */
    public static String extractS3Key(String urlOrKey) {
        if (urlOrKey == null || urlOrKey.trim().isEmpty()) {
            return null;
        }

        String trimmed = urlOrKey.trim();

        // 이미 S3 Key 형태인 경우 (URL이 아님)
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            return trimmed;
        }

        // S3 URL에서 Key 추출
        try {
            // amazonaws.com/ 뒤의 부분 추출
            int amazonIdx = trimmed.indexOf(".amazonaws.com/");
            if (amazonIdx == -1) {
                // amazonaws.com이 없으면 그냥 반환
                return trimmed;
            }

            String keyPart = trimmed.substring(amazonIdx + ".amazonaws.com/".length());

            // Query string 제거 (? 이후 제거)
            int queryIdx = keyPart.indexOf('?');
            if (queryIdx != -1) {
                keyPart = keyPart.substring(0, queryIdx);
            }

            return keyPart;

        } catch (Exception e) {
            // 파싱 실패 시 원본 반환
            return trimmed;
        }
    }

    /**
     * 문자열이 S3 Key 형태인지 확인 (URL이 아닌지)
     *
     * @param str 확인할 문자열
     * @return S3 Key 형태면 true
     */
    public static boolean isS3Key(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }

        String trimmed = str.trim();
        return !trimmed.startsWith("http://") && !trimmed.startsWith("https://");
    }

    /**
     * 문자열이 S3 URL 형태인지 확인
     *
     * @param str 확인할 문자열
     * @return S3 URL 형태면 true
     */
    public static boolean isS3Url(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }

        String trimmed = str.trim();
        return (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
                && trimmed.contains("amazonaws.com");
    }
}
