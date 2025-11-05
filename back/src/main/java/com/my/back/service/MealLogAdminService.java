package com.my.back.service;

import com.my.back.dto.meal.MealLogAdminDtos;
import com.my.back.entity.MealLog;
import com.my.back.entity.MealLogList;
import com.my.back.entity.Users;
import com.my.back.entity.TrainerInfo;
import com.my.back.repository.MealLogRepository;
import com.my.back.repository.MealLogListRepository;
import com.my.back.repository.UserRepository;
import com.my.back.repository.TrainerInfoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자용 식단 관리 서비스
 */
@Service
@RequiredArgsConstructor
public class MealLogAdminService {

    private final MealLogRepository mealLogRepository;
    private final MealLogListRepository mealLogListRepository;
    private final UserRepository usersRepository;
    private final TrainerInfoRepository trainerInfoRepository;

    /**
     * ✅ 식단 등록
     * - MealLog 저장
     * - MealLogList 반복 저장
     */
    @Transactional
    public Long create(MealLogAdminDtos.CreateReq req) {

        // 사용자 조회
        Users user = usersRepository.findById(req.uId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 트레이너 조회
        TrainerInfo trainer = trainerInfoRepository.findById(req.tId())
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        // 식단 메인 저장
        MealLog log = MealLog.builder()
                .users(user)
                .trainer(trainer)
                .mealType(req.mealType())
                .date(LocalDateTime.now())
                .build();
        mealLogRepository.save(log);

        // 상세 항목 저장
        req.mealLogList().forEach(item -> {
            MealLogList detail = MealLogList.builder()
                    .mealLog(log)
                    .mealType(item.mealType())
                    .foodNote(item.foodNote())
                    .pictureUrl(item.pictureUrl())
                    .trainerComment(item.trainerComment())
                    .build();
            mealLogListRepository.save(detail);
        });

        return log.getRecordId();
    }

    /**
     * ✅ 식단 전체 조회
     */
    public List<MealLogAdminDtos.Res> findAll() {
        return mealLogRepository.findAll().stream().map(this::toDto).toList();
    }

    /**
     * ✅ 식단 단건 조회
     */
    public MealLogAdminDtos.Res findById(Long recordId) {
        MealLog log = mealLogRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        return toDto(log);
    }

    /**
     * ✅ 식단 수정 (mealType만 변경)
     */
    @Transactional
    public void update(Long recordId, MealLogAdminDtos.UpdateReq req) {
        MealLog log = mealLogRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
        log.setMealType(req.mealType());
    }

    /**
     * ✅ 식단 삭제 (자동으로 상세 항목도 삭제)
     */
    @Transactional
    public void delete(Long recordId) {
        mealLogRepository.deleteById(recordId);
    }

    @Transactional
    public void updateTrainerComment(Long detailId, String comment) {

        var detail = mealLogListRepository.findById(detailId)
                .orElseThrow(() -> new IllegalArgumentException("식단 항목을 찾을 수 없습니다. id=" + detailId));

        detail.setTrainerComment(comment);
    }


    /**
     * ✅ Entity → DTO 변환
     */
    private MealLogAdminDtos.Res toDto(MealLog log) {

        List<MealLogAdminDtos.MealLogListDTO> list =
                mealLogListRepository.findByMealLog_RecordId(log.getRecordId())
                        .stream().map(item ->
                                new MealLogAdminDtos.MealLogListDTO(
                                        item.getId(),
                                        item.getMealType(),
                                        item.getFoodNote(),
                                        item.getTrainerComment(),
                                        item.getPictureUrl()
                                )
                        ).toList();

        return new MealLogAdminDtos.Res(
                log.getRecordId(),
                log.getUsers().getUId(),
                log.getTrainer().getTId(),
                log.getMealType(),
                log.getDate(),
                list
        );
    }
}
