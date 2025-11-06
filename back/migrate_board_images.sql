-- ========================================
-- Board 테이블 이미지 URL → S3 Key 마이그레이션
-- ========================================
--
-- 목적: Presigned URL을 S3 Key로 변환하여 URL 만료 문제 해결
--
-- 변환 예시:
-- Before: https://protein-friends-s3.s3.ap-northeast-2.amazonaws.com/uploads/123/uuid_file.jpg?X-Amz-...
-- After:  uploads/123/uuid_file.jpg
--
-- ⚠️ 주의: 실행 전 DB 백업 필수!
-- ========================================

-- 1. 현재 상태 확인 (마이그레이션 전)
SELECT
    p_id,
    p_title,
    p_image_url,
    CASE
        WHEN p_image_url LIKE '%amazonaws.com%' THEN 'URL (변환 필요)'
        WHEN p_image_url IS NULL THEN 'NULL'
        ELSE 'Key (변환 불필요)'
    END AS 'URL_타입'
FROM board
WHERE p_image_url IS NOT NULL;

-- 2. 변환 결과 미리보기 (실제 업데이트 안 함)
SELECT
    p_id,
    p_title,
    p_image_url AS '현재_URL',
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(p_image_url, '.amazonaws.com/', -1),
        '?',
        1
    ) AS '변환_후_S3_Key'
FROM board
WHERE p_image_url IS NOT NULL
  AND p_image_url LIKE '%amazonaws.com%';

-- 3. 실제 마이그레이션 실행
UPDATE board
SET p_image_url = SUBSTRING_INDEX(
    SUBSTRING_INDEX(p_image_url, '.amazonaws.com/', -1),
    '?',
    1
)
WHERE p_image_url IS NOT NULL
  AND p_image_url LIKE '%amazonaws.com%';

-- 4. 마이그레이션 결과 확인
SELECT
    p_id,
    p_title,
    p_image_url,
    CHAR_LENGTH(p_image_url) AS 'URL_길이',
    CASE
        WHEN p_image_url LIKE '%amazonaws.com%' THEN '❌ URL (변환 실패)'
        WHEN p_image_url LIKE 'uploads/%' THEN '✅ Key (변환 성공)'
        WHEN p_image_url IS NULL THEN 'NULL'
        ELSE '⚠️ 기타'
    END AS '마이그레이션_상태'
FROM board
WHERE p_image_url IS NOT NULL;

-- 5. 영향받은 행 수 확인
SELECT
    COUNT(*) AS '전체_게시글',
    SUM(CASE WHEN p_image_url IS NOT NULL THEN 1 ELSE 0 END) AS '이미지_있음',
    SUM(CASE WHEN p_image_url LIKE 'uploads/%' THEN 1 ELSE 0 END) AS '마이그레이션_완료'
FROM board;
