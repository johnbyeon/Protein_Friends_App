-- profile_picture 컬럼 타입 변경 (VARCHAR(255) → TEXT)
-- S3 URL은 매우 길기 때문에 TEXT 타입 필요

ALTER TABLE users MODIFY COLUMN profile_picture TEXT;

