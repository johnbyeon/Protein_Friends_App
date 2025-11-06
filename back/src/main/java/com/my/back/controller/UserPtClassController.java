package com.my.back.controller;

import com.my.back.dto.ptclass.UserPtClassDtos;
import com.my.back.service.UserPtClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/classes")
@RequiredArgsConstructor
public class UserPtClassController {

    private final UserPtClassService service;

    /** 전체 예약 가능한 PT 클래스 조회 */
    @GetMapping
    public ResponseEntity<List<UserPtClassDtos.ClassItem>> getAvailableClasses() {
        return ResponseEntity.ok(service.getAvailableClasses());
    }

    /** 내가 신청한 클래스 목록 조회 */
    @GetMapping("/me")
    public ResponseEntity<List<UserPtClassDtos.MyClassItem>> getMyClasses() {
        return ResponseEntity.ok(service.getMyClasses());
    }

    /** 예약 */
    @PostMapping("/{classId}")
    public ResponseEntity<Void> reserve(@PathVariable Long classId) {
        service.reserveClass(classId);
        return ResponseEntity.ok().build();
    }

    /** 예약 취소 */
    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> cancel(@PathVariable Long classId) {
        service.cancelReservation(classId);
        return ResponseEntity.noContent().build();
    }
}
