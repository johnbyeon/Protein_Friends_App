package com.my.back.service;

import com.my.back.dto.trainer.TrainerDtos.CreateReq;
import com.my.back.dto.trainer.TrainerDtos.UpdateReq;
import com.my.back.dto.trainer.TrainerDtos.Res;
import com.my.back.entity.GymInfo;
import com.my.back.entity.TrainerInfo;
import com.my.back.entity.Users;
import com.my.back.repository.GymInfoRepository;
import com.my.back.repository.TrainerInfoRepository;
import com.my.back.repository.UserRepository;
import com.my.back.service.spec.TrainerSpecs;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * TrainerService
 * - 트레이너 비즈니스 로직 처리
 * - CRUD + 필터 + 재직상태 변경 기능
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TrainerService {

    private final TrainerInfoRepository trainerRepo;
    private final UserRepository usersRepo;
    private final GymInfoRepository gymRepo;

    /** 트레이너 등록 */
    public Res create(CreateReq req) {
        // FK 존재 검증
        Users user = usersRepo.findById(req.uId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.uId()));
        GymInfo gym = gymRepo.findById(req.gId())
                .orElseThrow(() -> new IllegalArgumentException("Gym not found: " + req.gId()));

        // ✅ existsByuId (대소문자 수정)
        if (trainerRepo.existsByuId(req.uId())) {
            throw new IllegalStateException("This user already has a trainer profile.");
        }

        TrainerInfo entity = TrainerInfo.builder()
                .gId(req.gId())
                .uId(req.uId())
                .tName(req.tName())
                .tBirthDay(req.tBirthDay())
                .tPhoneNumber(req.tPhoneNumber())
                .tAwardTitle(req.tAwardTitle())
                .tAboutMe(req.tAboutMe())
                .isEmployed(req.isEmployed() == null ? Boolean.TRUE : req.isEmployed())
                .tImageUrl(req.tImageUrl())
                .build();

        TrainerInfo saved = trainerRepo.save(entity);
        return toRes(saved, gym.getGName(), user.getEmail());
    }

    /** 트레이너 목록 조회 (검색 + 필터 + 페이지네이션) */
    @Transactional(readOnly = true)
    public Page<Res> list(Long gymId, Boolean employed, String q, int page, int size, String sort) {
        Sort srt = (sort == null || sort.isBlank())
                ? Sort.by(Sort.Direction.DESC, "tId")
                : Sort.by(sort.startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sort.replace("-", ""));
        Pageable pageable = PageRequest.of(page, size, srt);

        Specification<TrainerInfo> spec = Specification.where(TrainerSpecs.gymIdEq(gymId))
                .and(TrainerSpecs.employedEq(employed))
                .and(TrainerSpecs.nameLike(q));

        return trainerRepo.findAll(spec, pageable).map(t ->
                toRes(t,
                        t.getGymInfo() != null ? t.getGymInfo().getGName() : null,
                        t.getUsers() != null ? t.getUsers().getEmail() : null)
        );
    }

    /** 트레이너 단건 조회 */
    @Transactional(readOnly = true)
    public Res get(Long tId) {
        TrainerInfo t = trainerRepo.findById(tId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + tId));
        return toRes(t,
                t.getGymInfo() != null ? t.getGymInfo().getGName() : null,
                t.getUsers() != null ? t.getUsers().getEmail() : null);
    }

    /** 트레이너 정보 수정 */
    public Res update(Long tId, UpdateReq req) {
        TrainerInfo t = trainerRepo.findById(tId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + tId));

        if (req.gId() != null) {
            gymRepo.findById(req.gId())
                    .orElseThrow(() -> new IllegalArgumentException("Gym not found: " + req.gId()));
            t.setGId(req.gId());
        }
        if (req.tName() != null) t.setTName(req.tName());
        if (req.tBirthDay() != null) t.setTBirthDay(req.tBirthDay());
        if (req.tPhoneNumber() != null) t.setTPhoneNumber(req.tPhoneNumber());
        if (req.tAwardTitle() != null) t.setTAwardTitle(req.tAwardTitle());
        if (req.tAboutMe() != null) t.setTAboutMe(req.tAboutMe());
        if (req.isEmployed() != null) t.setIsEmployed(req.isEmployed());
        if (req.tImageUrl() != null) t.setTImageUrl(req.tImageUrl());

        TrainerInfo saved = trainerRepo.save(t);
        return toRes(saved,
                saved.getGymInfo() != null ? saved.getGymInfo().getGName() : null,
                saved.getUsers() != null ? saved.getUsers().getEmail() : null);
    }

    /** 트레이너 삭제 */
    public void delete(Long tId) {
        if (!trainerRepo.existsById(tId)) {
            throw new IllegalArgumentException("Trainer not found: " + tId);
        }
        trainerRepo.deleteById(tId);
    }

    /** 재직상태 변경 */
    public Res toggleEmployment(Long tId, boolean employed) {
        TrainerInfo t = trainerRepo.findById(tId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + tId));
        t.setIsEmployed(employed);
        TrainerInfo saved = trainerRepo.save(t);

        // TODO: employed=false 시 Users.userRole → USER로 변경 로직 추가 가능
        return toRes(saved,
                saved.getGymInfo() != null ? saved.getGymInfo().getGName() : null,
                saved.getUsers() != null ? saved.getUsers().getEmail() : null);
    }

    /** 엔티티 → DTO 변환 */
    private Res toRes(TrainerInfo t, String gymName, String userEmail) {
        return new Res(
                t.getTId(),
                t.getGId(),
                t.getUId(),
                t.getTName(),
                t.getTBirthDay(),
                t.getTPhoneNumber(),
                t.getTAwardTitle(),
                t.getTAboutMe(),
                t.getIsEmployed(),
                t.getTImageUrl(),
                gymName,
                userEmail
        );
    }
}
