package com.my.back.repository;

import com.my.back.entity.TrainerUserMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrainerUserMappingRepository extends JpaRepository<TrainerUserMapping, Long> {
    Optional<TrainerUserMapping> findByUsers_uIdAndIsActiveTrue(Long uId);
}
