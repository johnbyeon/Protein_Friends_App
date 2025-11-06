// src/main/java/com/my/back/repository/MembershipServiceRepository.java
package com.my.back.repository;

import com.my.back.entity.MembershipService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipServiceRepository extends JpaRepository<MembershipService, Long> {
    
    /**
     * 활성 상태인 회원권 목록 조회
     */
    List<MembershipService> findByIsActiveTrue();
    
    /**
     * 비활성 상태인 회원권 목록 조회
     */
    List<MembershipService> findByIsActiveFalse();
    
    /**
     * 이미지 URL로 회원권 조회
     */
    java.util.Optional<MembershipService> findByMembershipPicUrl(String membershipPicUrl);
}
