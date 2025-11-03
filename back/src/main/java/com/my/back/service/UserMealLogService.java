package com.my.back.service;

import com.my.back.dto.meal.UserMealLogDtos;
import com.my.back.entity.MealLogList;
import com.my.back.repository.MealLogListRepository;
import com.my.back.repository.MealLogRepository;
import com.my.back.repository.UserRepository;
import com.my.back.repository.TrainerUserMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserMealLogService {

    private final MealLogRepository mealLogRepo;
    private final MealLogListRepository mealLogListRepo;
    private final UserRepository usersRepository;
    private final TrainerUserMappingRepository trainerUserMappingRepository;

    /** ✅ 회원 식단 등록 (트레이너 자동 연결) */
    @Transactional
    public Long create(UserMealLogDtos.CreateReq req) {

        var user = usersRepository.findById(req.uId())
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        var mapping = trainerUserMappingRepository.findByUsers_uIdAndIsActiveTrue(req.uId())
                .orElseThrow(() -> new IllegalArgumentException("담당 트레이너가 없습니다."));

        var mealLog = com.my.back.entity.MealLog.builder()
                .users(user)
                .trainer(mapping.getTrainer())
                .mealType(req.mealType())
                .date(req.date())
                .build();

        var saved = mealLogRepo.save(mealLog);

        req.mealItems().forEach(item -> {
            String note = item.food();
            if (item.kcal() != null) {
                note = note + " (kcal:" + item.kcal() + ")";
            }

            var detail = MealLogList.builder()
                    .mealLog(saved)
                    .mealType(item.mealType())
                    .foodNote(note)
                    .pictureUrl(item.pic())
                    .build();

            mealLogListRepo.save(detail);
        });

        return saved.getRecordId();
    }

    /** ✅ 회원 식단 전체 조회 → DTO 반환 */
    public List<UserMealLogDtos.Res> findByUser(Long uId) {
        var logs = mealLogRepo.findByUsers_uId(uId);

        return logs.stream().map(log -> {
            var details = mealLogListRepo.findByMealLog_RecordId(log.getRecordId());

            var items = details.stream()
                    .map(d -> new UserMealLogDtos.MealItemDTO(
                            d.getFoodNote(),   // food <= foodNote
                            extractKcal(d.getFoodNote()),
                            d.getPictureUrl(), // pic <= pictureUrl
                            d.getMealType()    // mealType
                    ))
                    .toList();

            return new UserMealLogDtos.Res(
                    log.getRecordId(),
                    log.getUsers().getUId(),
                    log.getTrainer().getTId(),
                    log.getMealType(),
                    log.getDate(),
                    items
            );
        }).toList();
    }

    /** ✅ 단건 조회 → DTO 반환 */
    public UserMealLogDtos.Res findOne(Long id) {
        var log = mealLogRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("식단 기록을 찾을 수 없습니다."));

        var details = mealLogListRepo.findByMealLog_RecordId(log.getRecordId());

        var items = details.stream()
                .map(d -> new UserMealLogDtos.MealItemDTO(
                        d.getFoodNote(),   // food
                        extractKcal(d.getFoodNote()),
                        d.getPictureUrl(), // pic
                        d.getMealType()    // mealType
                ))
                .toList();

        return new UserMealLogDtos.Res(
                log.getRecordId(),
                log.getUsers().getUId(),
                log.getTrainer().getTId(),
                log.getMealType(),
                log.getDate(),
                items
        );
    }

    private Integer extractKcal(String note) {
        if (note == null) return null;
        int i = note.indexOf("(kcal:");
        if (i < 0) return null;
        int j = note.indexOf(")", i);
        if (j < 0) return null;

        try {
            return Integer.parseInt(note.substring(i + 6, j).trim());
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public void update(Long recordId, UserMealLogDtos.UpdateReq req) {

        var log = mealLogRepo.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("기록 없음"));

        // 식단 상단 정보 수정
        log.setMealType(req.mealType());
        log.setDate(req.date());

        // 기존 상세 항목 삭제
        mealLogListRepo.deleteByMealLog_RecordId(recordId);

        // 다시 저장 (새로운 항목)
        req.mealItems().forEach(item -> {
            String note = item.food();
            if (item.kcal() != null) {
                note += " (kcal:" + item.kcal() + ")";
            }

            var detail = MealLogList.builder()
                    .mealLog(log)
                    .mealType(item.mealType())
                    .foodNote(note)
                    .pictureUrl(item.pic())
                    .build();

            mealLogListRepo.save(detail);
        });
    }




    /** ✅ 삭제 */
    @Transactional
    public void delete(Long id) {
        mealLogListRepo.deleteByMealLog_RecordId(id);
        mealLogRepo.deleteById(id);
    }


}
