-- 게시판 타입 기본 데이터 삽입
-- board_type 테이블에 기본 게시판 타입 추가

INSERT INTO board_type (p_type_address_name, p_type_name, display_order) VALUES
('notices', '공지사항', 1),
('events', '이벤트', 2),
('benefits', '혜택', 3);