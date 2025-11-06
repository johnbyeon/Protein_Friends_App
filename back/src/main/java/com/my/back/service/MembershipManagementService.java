package com.my.back.service;

import com.my.back.entity.MembershipService;
import com.my.back.repository.MembershipServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 기간제 회원권 관리 서비스
 * - 회원권 상품 CRUD
 * - 트레이너/관리자용 기능
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipManagementService {

    private final MembershipServiceRepository membershipServiceRepository;

    /**
     * 전체 회원권 목록 조회
     */
    public List<MembershipService> getAllMemberships() {
        return membershipServiceRepository.findAll();
    }

    /**
     * 활성 회원권 목록 조회
     */
    public List<MembershipService> getActiveMemberships() {
        return membershipServiceRepository.findByIsActiveTrue();
    }

    /**
     * ID로 회원권 조회
     */
    public Optional<MembershipService> getMembershipById(Long id) {
        return membershipServiceRepository.findById(id);
    }

    /**
     * 회원권 생성
     */
    @Transactional
    public MembershipService createMembership(MembershipService membershipService) {
        log.info("Creating new membership: {}", membershipService.getMembershipName());
        return membershipServiceRepository.save(membershipService);
    }

    /**
     * 회원권 수정
     */
    @Transactional
    public MembershipService updateMembership(Long id, MembershipService updateData) {
        MembershipService existing = membershipServiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + id));

        // 필드 업데이트
        if (updateData.getMembershipName() != null) {
            existing.setMembershipName(updateData.getMembershipName());
        }
        if (updateData.getMembershipDurationDays() != null) {
            existing.setMembershipDurationDays(updateData.getMembershipDurationDays());
        }
        if (updateData.getMembershipPrice() != null) {
            existing.setMembershipPrice(updateData.getMembershipPrice());
        }
        if (updateData.getMembershipSalePrice() != null) {
            existing.setMembershipSalePrice(updateData.getMembershipSalePrice());
        }
        if (updateData.getMembershipPicUrl() != null) {
            existing.setMembershipPicUrl(updateData.getMembershipPicUrl());
        }
        if (updateData.getIsActive() != null) {
            existing.setIsActive(updateData.getIsActive());
        }

        log.info("Updated membership: {}", existing.getMembershipName());
        return membershipServiceRepository.save(existing);
    }

    /**
     * 회원권 삭제
     */
    @Transactional
    public void deleteMembership(Long id) {
        if (!membershipServiceRepository.existsById(id)) {
            throw new IllegalArgumentException("Membership not found: " + id);
        }
        membershipServiceRepository.deleteById(id);
        log.info("Deleted membership with ID: {}", id);
    }

    /**
     * 회원권 활성/비활성 상태 변경
     */
    @Transactional
    public MembershipService toggleMembershipStatus(Long id, Boolean isActive) {
        MembershipService membership = membershipServiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found: " + id));
        
        membership.setIsActive(isActive);
        log.info("Toggled membership status for ID {}: {}", id, isActive ? "ACTIVE" : "INACTIVE");
        return membershipServiceRepository.save(membership);
    }
}