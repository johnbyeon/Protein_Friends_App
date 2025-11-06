package com.my.back.controller;

import com.my.back.entity.MembershipService;
import com.my.back.service.MembershipManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 기간제 회원권 관리 컨트롤러
 * - 트레이너/관리자용 회원권 CRUD
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/memberships")
@PreAuthorize("hasRole('TRAINER') or hasRole('ADMIN')")
public class MembershipManagementController {

    private final MembershipManagementService membershipManagementService;

    /**
     * 전체 회원권 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<MembershipService>> getAllMemberships() {
        List<MembershipService> memberships = membershipManagementService.getAllMemberships();
        return ResponseEntity.ok(memberships);
    }

    /**
     * 활성 회원권 목록 조회
     */
    @GetMapping("/active")
    public ResponseEntity<List<MembershipService>> getActiveMemberships() {
        List<MembershipService> memberships = membershipManagementService.getActiveMemberships();
        return ResponseEntity.ok(memberships);
    }

    /**
     * 회원권 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<MembershipService> getMembershipById(@PathVariable Long id) {
        return membershipManagementService.getMembershipById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 회원권 생성
     */
    @PostMapping
    public ResponseEntity<MembershipService> createMembership(@RequestBody MembershipService membershipService) {
        try {
            MembershipService created = membershipManagementService.createMembership(membershipService);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("Failed to create membership", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 회원권 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<MembershipService> updateMembership(
            @PathVariable Long id,
            @RequestBody MembershipService membershipService) {
        try {
            MembershipService updated = membershipManagementService.updateMembership(id, membershipService);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.error("Membership not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to update membership", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 회원권 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMembership(@PathVariable Long id) {
        try {
            membershipManagementService.deleteMembership(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Membership not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to delete membership", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 회원권 활성/비활성 상태 변경
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<MembershipService> toggleMembershipStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        try {
            MembershipService updated = membershipManagementService.toggleMembershipStatus(id, isActive);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.error("Membership not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to toggle membership status", e);
            return ResponseEntity.badRequest().build();
        }
    }
}