package com.my.back.controller;

import com.my.back.dto.ptclass.AdminPtClassDtos;
import com.my.back.service.AdminPtClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 PT 클래스 API
 *
 * 주요 기능:
 *  - 전체 클래스 스케줄 조회
 *  - 클래스 상세 조회
 *  - 클래스 생성/수정
 *  - 회원 예약/취소
 *
 * REST 규칙:
 *  GET    /api/admin/classes/schedule        → 전체 클래스 조회
 *  GET    /api/admin/classes/{classId}       → 단일 클래스 조회
 *  POST   /api/admin/classes                 → 클래스 생성
 *  PUT    /api/admin/classes/{classId}       → 클래스 수정
 *  POST   /api/admin/classes/{classId}/users → 회원 예약 추가
 *  DELETE /api/admin/classes/{cid}/users/{uid} → 회원 예약 취소
 */
@RestController
@RequestMapping("/api/admin/classes")
@RequiredArgsConstructor
public class AdminPtClassController {

    private final AdminPtClassService service;

    /**
     * 전체 PT 클래스 스케줄 조회 (관리자)
     * - /schedule 사용 → UI에서 달력, 리스트 조회용
     */
    @GetMapping("/schedule")
    public ResponseEntity<List<AdminPtClassDtos.ScheduleItem>> getSchedule() {
        return ResponseEntity.ok(service.getSchedule());
    }

    /**
     * 단일 클래스 상세 조회
     * - 예약 회원 리스트 포함
     */
    @GetMapping("/{classId}")
    public ResponseEntity<AdminPtClassDtos.ClassDetail> getClassDetail(@PathVariable Long classId) {
        return ResponseEntity.ok(service.getClassDetail(classId));
    }

    /**
     * 새 클래스 등록
     * - 관리자가 PT 클래스 스케줄 생성
     */
    @PostMapping
    public ResponseEntity<AdminPtClassDtos.ClassDetail> createClass(
            @RequestBody @Valid AdminPtClassDtos.CreateClassRequest req
    ) {
        AdminPtClassDtos.ClassDetail created = service.createClass(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 클래스 수정
     * - 이미 시작한 클래스는 수정 불가 (Service에서 검증)
     */
    @PutMapping("/{classId}")
    public ResponseEntity<AdminPtClassDtos.ClassDetail> updateClass(
            @PathVariable Long classId,
            @RequestBody @Valid AdminPtClassDtos.UpdateClassRequest req
    ) {
        return ResponseEntity.ok(service.updateClass(classId, req));
    }

    /**
     * 회원을 PT 클래스에 예약
     * - 정원 체크
     * - 중복 예약 차단
     * - PT 횟수 차감 처리
     */
    @PostMapping("/{classId}/users")
    public ResponseEntity<AdminPtClassDtos.ClassDetail> addUserToClass(
            @PathVariable Long classId,
            @RequestBody @Valid AdminPtClassDtos.BookingRequest req
    ) {
        return ResponseEntity.ok(service.addUserToClass(classId, req));
    }

    /**
     * 회원 예약 취소
     * - 예약 삭제
     * - PT 횟수 복구
     * - 최근 사용 로그 취소 처리
     */
    @DeleteMapping("/{classId}/users/{userId}")
    public ResponseEntity<Void> removeUserFromClass(
            @PathVariable Long classId,
            @PathVariable Long userId
    ) {
        service.removeUserFromClass(classId, userId);
        return ResponseEntity.noContent().build();
    }
}
