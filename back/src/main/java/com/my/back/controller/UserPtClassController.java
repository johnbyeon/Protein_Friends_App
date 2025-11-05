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
}
