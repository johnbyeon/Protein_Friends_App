package com.my.back.repository;

import com.my.back.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * UserInfo 엔티티용 레포지토리
 * - @MapsId 공유 PK 구조라서 기본 findById(uId)로 충분함
 */
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> { }
