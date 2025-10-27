package com.my.back.repository;

import com.my.back.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Users,Long> {

    boolean existsByEmail(String email);
    //username을 받아 DB 테이블에서 회원을 조회하는 메소드 작성
    Users findByEmail(String email);
}
