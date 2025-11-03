package com.my.back.service.spec;

import com.my.back.entity.TrainerInfo;
import org.springframework.data.jpa.domain.Specification;

/**
 * 트레이너 검색/필터용 스펙
 * - 동적 where 절 조립
 */
public final class TrainerSpecs {

    private TrainerSpecs() {}

    public static Specification<TrainerInfo> gymIdEq(Long gymId) {
        return (root, q, cb) -> gymId == null ? null : cb.equal(root.get("gId"), gymId);
    }

    public static Specification<TrainerInfo> employedEq(Boolean employed) {
        return (root, q, cb) -> employed == null ? null : cb.equal(root.get("isEmployed"), employed);
    }

    public static Specification<TrainerInfo> nameLike(String qstr) {
        if (qstr == null || qstr.isBlank()) return null;
        String like = "%" + qstr.toLowerCase() + "%";
        return (root, q, cb) -> cb.like(cb.lower(root.get("tName")), like);
    }
}
