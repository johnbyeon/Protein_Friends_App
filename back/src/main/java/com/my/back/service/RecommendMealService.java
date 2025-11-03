package com.my.back.service;

import com.my.back.dto.recommend.RecommendMealDtos;
import com.my.back.entity.RecommendMeal;
import com.my.back.entity.RecommendMealLog;
import com.my.back.repository.RecommendMealLogRepository;
import com.my.back.repository.RecommendMealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendMealService {

    private final RecommendMealRepository mealRepo;
    private final RecommendMealLogRepository logRepo;

    /** 추천 식단 생성 */
    public Long create(RecommendMealDtos.CreateReq req) {

        RecommendMeal meal = RecommendMeal.builder()
                .userId(req.userId())
                .trainerId(req.trainerId())
                .date(req.date())
                .build();

        RecommendMeal saved = mealRepo.save(meal);

        // 세부 로그 저장
        req.logs().forEach(log -> {
            RecommendMealLog item = RecommendMealLog.builder()
                    .food(log.food())
                    .kcal(log.kcal())
                    .pic(log.pic())
                    .mealType(Enum.valueOf(com.my.back.entity.MealType.class, log.mealType()))
                    .recommendMeal(saved)
                    .build();
            logRepo.save(item);
        });

        return saved.getId();
    }

    /** 회원 추천 식단 전체 조회 */
    public List<RecommendMealDtos.Res> getByUser(Long userId) {
        return mealRepo.findByUserId(userId)
                .stream()
                .map(this::toRes)
                .collect(Collectors.toList());
    }

    /** 상세조회 */
    public RecommendMealDtos.Res getDetail(Long recId) {
        return mealRepo.findById(recId)
                .map(this::toRes)
                .orElse(null);
    }

    /** 삭제 */
    public void delete(Long recId) {
        mealRepo.deleteById(recId);
    }

    /** entity → DTO 변환 */
    private RecommendMealDtos.Res toRes(RecommendMeal m) {
        List<RecommendMealDtos.RecommendMealLogDTO> logs =
                m.getMealLogs().stream().map(l ->
                        new RecommendMealDtos.RecommendMealLogDTO(
                                l.getId(),
                                l.getFood(),
                                l.getKcal(),
                                l.getPic(),
                                l.getMealType().name()
                        )
                ).toList();

        return new RecommendMealDtos.Res(
                m.getId(),
                m.getUserId(),
                m.getTrainerId(),
                m.getDate(),
                logs
        );
    }
}
