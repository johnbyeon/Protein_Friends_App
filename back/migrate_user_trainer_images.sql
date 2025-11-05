-- ========================================
-- Users, TrainerInfo 테이블 이미지 URL → S3 Key 마이그레이션
-- ========================================
--
-- 목적: Presigned URL을 S3 Key로 변환하여 URL 만료 문제 해결
--
-- 변환 대상:
-- 1. users.profile_picture
-- 2. trainer_info.t_image_url
--
-- ⚠️ 주의: 실행 전 DB 백업 필수!
-- ========================================

-- ==================== USERS 테이블 ====================

-- 1. Users - 현재 상태 확인
SELECT
    u_id,
    name,
    profile_picture,
    CASE
        WHEN profile_picture LIKE '%amazonaws.com%' THEN 'URL (변환 필요)'
        WHEN profile_picture IS NULL THEN 'NULL'
        ELSE 'Key (변환 불필요)'
    END AS 'URL_타입'
FROM users
WHERE profile_picture IS NOT NULL
LIMIT 20;

-- 2. Users - 변환 결과 미리보기
SELECT
    u_id,
    name,
    profile_picture AS '현재_URL',
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(profile_picture, '.amazonaws.com/', -1),
        '?',
        1
    ) AS '변환_후_S3_Key'
FROM users
WHERE profile_picture IS NOT NULL
  AND profile_picture LIKE '%amazonaws.com%';

-- 3. Users - 실제 마이그레이션 실행
UPDATE users
SET profile_picture = SUBSTRING_INDEX(
    SUBSTRING_INDEX(profile_picture, '.amazonaws.com/', -1),
    '?',
    1
)
WHERE profile_picture IS NOT NULL
  AND profile_picture LIKE '%amazonaws.com%';

-- 4. Users - 마이그레이션 결과 확인
SELECT
    u_id,
    name,
    profile_picture,
    CHAR_LENGTH(profile_picture) AS 'URL_길이',
    CASE
        WHEN profile_picture LIKE '%amazonaws.com%' THEN '❌ URL (변환 실패)'
        WHEN profile_picture LIKE 'uploads/%' THEN '✅ Key (변환 성공)'
        WHEN profile_picture IS NULL THEN 'NULL'
        ELSE '⚠️ 기타'
    END AS '마이그레이션_상태'
FROM users
WHERE profile_picture IS NOT NULL
LIMIT 20;

-- ==================== TRAINER_INFO 테이블 ====================

-- 5. TrainerInfo - 현재 상태 확인
SELECT
    t_id,
    t_name,
    t_image_url,
    CASE
        WHEN t_image_url LIKE '%amazonaws.com%' THEN 'URL (변환 필요)'
        WHEN t_image_url IS NULL THEN 'NULL'
        ELSE 'Key (변환 불필요)'
    END AS 'URL_타입'
FROM trainer_info
WHERE t_image_url IS NOT NULL
LIMIT 20;

-- 6. TrainerInfo - 변환 결과 미리보기
SELECT
    t_id,
    t_name,
    t_image_url AS '현재_URL',
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(t_image_url, '.amazonaws.com/', -1),
        '?',
        1
    ) AS '변환_후_S3_Key'
FROM trainer_info
WHERE t_image_url IS NOT NULL
  AND t_image_url LIKE '%amazonaws.com%';

-- 7. TrainerInfo - 실제 마이그레이션 실행
UPDATE trainer_info
SET t_image_url = SUBSTRING_INDEX(
    SUBSTRING_INDEX(t_image_url, '.amazonaws.com/', -1),
    '?',
    1
)
WHERE t_image_url IS NOT NULL
  AND t_image_url LIKE '%amazonaws.com%';

-- 8. TrainerInfo - 마이그레이션 결과 확인
SELECT
    t_id,
    t_name,
    t_image_url,
    CHAR_LENGTH(t_image_url) AS 'URL_길이',
    CASE
        WHEN t_image_url LIKE '%amazonaws.com%' THEN '❌ URL (변환 실패)'
        WHEN t_image_url LIKE 'uploads/%' THEN '✅ Key (변환 성공)'
        WHEN t_image_url IS NULL THEN 'NULL'
        ELSE '⚠️ 기타'
    END AS '마이그레이션_상태'
FROM trainer_info
WHERE t_image_url IS NOT NULL
LIMIT 20;

-- ==================== 전체 요약 ====================

-- 9. 영향받은 행 수 확인
SELECT
    'Users' AS '테이블',
    COUNT(*) AS '전체_행',
    SUM(CASE WHEN profile_picture IS NOT NULL THEN 1 ELSE 0 END) AS '이미지_있음',
    SUM(CASE WHEN profile_picture LIKE 'uploads/%' THEN 1 ELSE 0 END) AS '마이그레이션_완료'
FROM users

UNION ALL

SELECT
    'TrainerInfo' AS '테이블',
    COUNT(*) AS '전체_행',
    SUM(CASE WHEN t_image_url IS NOT NULL THEN 1 ELSE 0 END) AS '이미지_있음',
    SUM(CASE WHEN t_image_url LIKE 'uploads/%' THEN 1 ELSE 0 END) AS '마이그레이션_완료'
FROM trainer_info;

-- ==================== 롤백 (필요 시) ====================

-- ⚠️ 백업이 있는 경우에만 사용
-- 실행 전에 반드시 백업 테이블 확인!

-- Users 롤백 예시 (백업 테이블이 있는 경우)
-- UPDATE users u
-- JOIN users_backup ub ON u.u_id = ub.u_id
-- SET u.profile_picture = ub.profile_picture
-- WHERE u.profile_picture IS NOT NULL;

-- TrainerInfo 롤백 예시 (백업 테이블이 있는 경우)
-- UPDATE trainer_info t
-- JOIN trainer_info_backup tb ON t.t_id = tb.t_id
-- SET t.t_image_url = tb.t_image_url
-- WHERE t.t_image_url IS NOT NULL;
