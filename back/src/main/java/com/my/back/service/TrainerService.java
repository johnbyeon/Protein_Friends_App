package com.my.back.service;

import com.my.back.dto.TrainerProfileResponse;
import com.my.back.dto.TrainerProfileUpdateRequest;
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

        // ✅ 트레이너 등록 시 User의 role을 TRAINER로 변경
        user.setRole(com.my.back.entity.UserRole.TRAINER);
        usersRepo.save(user);

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

        Specification<TrainerInfo> spec = Specification.allOf(
                TrainerSpecs.gymIdEq(gymId),
                TrainerSpecs.employedEq(employed),
                TrainerSpecs.nameLike(q)
        );

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
        TrainerInfo trainer = trainerRepo.findById(tId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + tId));

        // ✅ 트레이너 삭제 시 User의 role을 USER로 복원
        Users user = usersRepo.findById(trainer.getUId()).orElse(null);
        if (user != null) {
            user.setRole(com.my.back.entity.UserRole.USER);
            usersRepo.save(user);
        }

        trainerRepo.deleteById(tId);
    }

    /** 재직상태 변경 */
    public Res toggleEmployment(Long tId, boolean employed) {
        TrainerInfo t = trainerRepo.findById(tId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + tId));
        t.setIsEmployed(employed);
        TrainerInfo saved = trainerRepo.save(t);

        // ✅ 재직 상태에 따라 User role 변경
        Users user = usersRepo.findById(t.getUId()).orElse(null);
        if (user != null) {
            if (employed) {
                // 재직 중 → TRAINER
                user.setRole(com.my.back.entity.UserRole.TRAINER);
            } else {
                // 퇴직 → USER로 복원
                user.setRole(com.my.back.entity.UserRole.USER);
            }
            usersRepo.save(user);
        }

        return toRes(saved,
                saved.getGymInfo() != null ? saved.getGymInfo().getGName() : null,
                saved.getUsers() != null ? saved.getUsers().getEmail() : null);
    }

    /**
     * 트레이너 본인 프로필 조회
     * @param uId 유저 ID (JWT에서 추출)
     * @return TrainerProfileResponse
     */
    @Transactional(readOnly = true)
    public TrainerProfileResponse getMyProfile(Long uId) {
        TrainerInfo trainer = trainerRepo.findByuId(uId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer profile not found for user: " + uId));

        String gymName = trainer.getGymInfo() != null ? trainer.getGymInfo().getGName() : null;

        return TrainerProfileResponse.builder()
                .tId(trainer.getTId())
                .tName(trainer.getTName())
                .tBirthDay(trainer.getTBirthDay())
                .tPhoneNumber(trainer.getTPhoneNumber())
                .tAwardTitle(trainer.getTAwardTitle())
                .tAboutMe(trainer.getTAboutMe())
                .tImageUrl(trainer.getTImageUrl())
                .isEmployed(trainer.getIsEmployed())
                .gymName(gymName)
                .gId(trainer.getGId())
                .build();
    }

    /**
     * 트레이너 본인 프로필 수정
     * @param uId 유저 ID (JWT에서 추출)
     * @param request 수정 요청 DTO
     * @return TrainerProfileResponse
     */
    public TrainerProfileResponse updateMyProfile(Long uId, TrainerProfileUpdateRequest request) {
        TrainerInfo trainer = trainerRepo.findByuId(uId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer profile not found for user: " + uId));

        // 수정 가능한 필드만 업데이트
        if (request.getTAwardTitle() != null) {
            trainer.setTAwardTitle(request.getTAwardTitle());
        }
        if (request.getTAboutMe() != null) {
            trainer.setTAboutMe(request.getTAboutMe());
        }
        if (request.getTImageUrl() != null) {
            trainer.setTImageUrl(request.getTImageUrl());
        }

        TrainerInfo saved = trainerRepo.save(trainer);
        String gymName = saved.getGymInfo() != null ? saved.getGymInfo().getGName() : null;

        return TrainerProfileResponse.builder()
                .tId(saved.getTId())
                .tName(saved.getTName())
                .tBirthDay(saved.getTBirthDay())
                .tPhoneNumber(saved.getTPhoneNumber())
                .tAwardTitle(saved.getTAwardTitle())
                .tAboutMe(saved.getTAboutMe())
                .tImageUrl(saved.getTImageUrl())
                .isEmployed(saved.getIsEmployed())
                .gymName(gymName)
                .gId(saved.getGId())
                .build();
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
