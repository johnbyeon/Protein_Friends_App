package com.my.back.repository;

import com.my.back.entity.Users;
import org.springframework.data.jpa.repository.EntityGraph; // ✅ 추가
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Users, Long> {


    boolean existsByEmail(String email);
    //username을 받아 DB 테이블에서 회원을 조회하는 메소드 작성
    Users findByEmail(String email);

    // ✅ 추가: Users + userInfo + socialAccounts를 한 번에 로딩
    //  - OAuth2 성공 핸들러, MyInfo 조회 등에 N+1 없이 사용
    @EntityGraph(attributePaths = {"userInfo", "socialAccounts"})
    Users findWithUserInfoAndSocialAccountsByEmail(String email);
}
