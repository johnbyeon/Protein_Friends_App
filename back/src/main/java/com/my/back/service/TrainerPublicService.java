package com.my.back.service;

import com.my.back.dto.trainer.TrainerPublicDtos.DetailRes;
import com.my.back.dto.trainer.TrainerPublicDtos.SummaryRes;
import com.my.back.entity.TrainerInfo;
import com.my.back.repository.TrainerInfoRepository;
import com.my.back.repository.TrainerReviewRepository;
import com.my.back.repository.projection.TrainerReviewStats;
import com.my.back.service.spec.TrainerSpecs;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 회원 전용 트레이너 조회 비즈니스 로직.
 * <p>
 * 트레이너 엔티티는 그대로 두고 DTO로 변환해 전달한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainerPublicService {

    private final TrainerInfoRepository trainerRepo;
    private final TrainerReviewRepository reviewRepo;

    /**
     * 회원용 트레이너 목록 조회.
     * <p>
     * - 지점 ID와 키워드 조건으로 Specification 조립
     * - 재직 중인 트레이너만 조회
     * - 리뷰 통계는 한번에 모아서 N+1을 방지
     */
    public Page<SummaryRes> list(Long gymId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "tName"));
        Specification<TrainerInfo> spec = Specification.where(TrainerSpecs.gymIdEq(gymId))
                .and(TrainerSpecs.employedEq(Boolean.TRUE))
                .and(TrainerSpecs.nameLike(keyword));

        Page<TrainerInfo> trainers = trainerRepo.findAll(spec, pageable);
        Map<Long, TrainerReviewStats> statsMap = loadStats(trainers.getContent());

        return trainers.map(trainer -> toSummary(trainer, statsMap.get(trainer.getTId())));
    }

    /**
     * 회원용 트레이너 상세 조회.
     * <p>
     * 상세 화면에서 필요한 정보만 엄선하여 반환한다.
     */
    public DetailRes get(Long trainerId) {
        TrainerInfo trainer = trainerRepo.findById(trainerId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + trainerId));

        if (Boolean.FALSE.equals(trainer.getIsEmployed())) {
            throw new IllegalStateException("Trainer is not employed: " + trainerId);
        }

        TrainerReviewStats stats = reviewRepo.fetchStatsByTrainerIds(List.of(trainerId))
                .stream()
                .findFirst()
                .orElse(null);

        return toDetail(trainer, stats);
    }

    /**
     * 조회된 트레이너 목록에 대한 리뷰 통계를 미리 로딩.
     * <p>
     * 목록 화면에서는 평균/카운트 정보가 모두 필요하므로 미리 Map 형태로 변환한다.
     */
    private Map<Long, TrainerReviewStats> loadStats(Collection<TrainerInfo> trainers) {
        if (trainers.isEmpty()) {
            return Map.of();
        }
        List<Long> trainerIds = trainers.stream()
                .map(TrainerInfo::getTId)
                .toList();
        List<TrainerReviewStats> statsList = reviewRepo.fetchStatsByTrainerIds(trainerIds);
        return statsList.stream()
                .collect(Collectors.toMap(TrainerReviewStats::getTrainerId, Function.identity()));
    }

    /**
     * 트레이너 엔티티를 목록 요약 DTO로 변환.
     * <p>
     * 통계값이 없을 경우 0으로 초기화하여 클라이언트에서 별도 처리 필요 없게 한다.
     */
    private SummaryRes toSummary(TrainerInfo trainer, TrainerReviewStats stats) {
        double average = stats != null && stats.getAverageRating() != null ? stats.getAverageRating() : 0.0;
        long count = stats != null && stats.getReviewCount() != null ? stats.getReviewCount() : 0L;
        return new SummaryRes(
                trainer.getTId(),
                trainer.getTName(),
                trainer.getTImageUrl(),
                trainer.getGymInfo() != null ? trainer.getGymInfo().getGName() : null,
                trainer.getTAwardTitle(),
                roundHalfUp(average),
                count
        );
    }

    /**
     * 트레이너 엔티티를 상세 DTO로 변환.
     * <p>
     * 목록 조회에서 통계를 이미 받아온 경우 재활용하고,
     * 없다면 필요 최소 쿼리로 평균/카운트를 채워 넣는다.
     */
    private DetailRes toDetail(TrainerInfo trainer, TrainerReviewStats stats) {
        double average = 0.0;
        long count = 0L;
        if (stats != null) {
            average = stats.getAverageRating() != null ? stats.getAverageRating() : 0.0;
            count = stats.getReviewCount() != null ? stats.getReviewCount() : 0L;
        } else {
            Double avg = reviewRepo.getAverageRating(trainer.getTId());
            if (avg != null) {
                average = avg;
            }
            count = reviewRepo.countBytId(trainer.getTId());
        }

        return new DetailRes(
                trainer.getTId(),
                trainer.getGId(),
                trainer.getTName(),
                trainer.getTImageUrl(),
                trainer.getGymInfo() != null ? trainer.getGymInfo().getGName() : null,
                trainer.getTPhoneNumber(),
                trainer.getTAwardTitle(),
                trainer.getTAboutMe(),
                roundHalfUp(average),
                count
        );
    }

    /**
     * 평균 평점을 소수 첫째 자리에서 반올림.
     * <p>
     * UI 노출 시 지나치게 많은 소수를 보여주지 않기 위함.
     */
    private double roundHalfUp(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}