// src/main/java/com/my/back/repository/MembershipServiceRepository.java
package com.my.back.repository;

import com.my.back.entity.MembershipService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MembershipServiceRepository extends JpaRepository<MembershipService, Long> {
}
