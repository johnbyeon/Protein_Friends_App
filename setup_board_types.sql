-- board_type 테이블에 기본 게시판 타입 추가
-- 이미 데이터가 있으면 무시하도록 처리

INSERT IGNORE INTO board_type (p_type_address_name, p_type_name, display_order) VALUES
('notices', '공지사항', 1),
('events', '이벤트', 2),
('benefits', '혜택', 3);