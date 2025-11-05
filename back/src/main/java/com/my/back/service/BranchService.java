package com.my.back.service;

import com.my.back.dto.BranchDetailResponse;
import com.my.back.dto.BranchStationResponse;
import com.my.back.dto.BranchTrainerResponse;
import com.my.back.entity.GymInfo;
import com.my.back.entity.GymStationInfo;
import com.my.back.entity.TrainerInfo;
import com.my.back.repository.GymInfoRepository;
import com.my.back.repository.GymStationInfoRepository;
import com.my.back.repository.TrainerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ==============================================================
 * 🔹 BranchService - 지점 정보 서비스
 * ==============================================================
 * ✅ 핵심 기능
 *  1) 전체 지점 목록 조회 (주변 역 정보 포함)
 *  2) 특정 지점 상세 조회
 *  3) 특정 지점의 트레이너 목록 조회
 * ==============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BranchService {

    private final GymInfoRepository gymInfoRepository;
    private final GymStationInfoRepository gymStationInfoRepository;
    private final TrainerInfoRepository trainerInfoRepository;

    /**
     * 전체 지점 목록 조회 (주변 역 정보 포함)
     *
     * @return 지점 목록
     */
    @Transactional(readOnly = true)
    public List<BranchDetailResponse> getAllBranches() {
        log.info("전체 지점 목록 조회 시작");

        List<GymInfo> gymList = gymInfoRepository.findAll();

        return gymList.stream()
                .map(gym -> {
                    // 주변 역 정보 조회
                    List<GymStationInfo> stations = gymStationInfoRepository.findByGId(gym.getGId());
                    List<BranchStationResponse> stationResponses = stations.stream()
                            .map(station -> BranchStationResponse.builder()
                                    .stationName(station.getGStationName())
                                    .stationLine(extractLineNumber(station.getGLineNumber()))
                                    .walkTime(extractWalkTime(station.getGWalkingDistance()))
                                    .build())
                            .collect(Collectors.toList());

                    return BranchDetailResponse.builder()
                            .gId(gym.getGId())
                            .gName(gym.getGName())
                            .gAddress(gym.getGAddress())
                            .gTel(gym.getGTel())
                            .gWorkoutDuration(gym.getGWorkoutDuration())
                            .gParking(gym.getGParking())
                            .gLatitude(gym.getGLatitude())
                            .gLongitude(gym.getGLongitude())
                            .gImageUrl(gym.getGImageUrl())
                            .stations(stationResponses)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 특정 지점 상세 조회
     *
     * @param gId 지점 번호
     * @return 지점 상세 정보
     */
    @Transactional(readOnly = true)
    public BranchDetailResponse getBranchDetail(Long gId) {
        log.info("지점 상세 조회 - gId: {}", gId);

        GymInfo gym = gymInfoRepository.findById(gId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다. gId=" + gId));

        // 주변 역 정보 조회
        List<GymStationInfo> stations = gymStationInfoRepository.findByGId(gId);
        List<BranchStationResponse> stationResponses = stations.stream()
                .map(station -> BranchStationResponse.builder()
                        .stationName(station.getGStationName())
                        .stationLine(extractLineNumber(station.getGLineNumber()))
                        .walkTime(extractWalkTime(station.getGWalkingDistance()))
                        .build())
                .collect(Collectors.toList());

        return BranchDetailResponse.builder()
                .gId(gym.getGId())
                .gName(gym.getGName())
                .gAddress(gym.getGAddress())
                .gTel(gym.getGTel())
                .gWorkoutDuration(gym.getGWorkoutDuration())
                .gParking(gym.getGParking())
                .gLatitude(gym.getGLatitude())
                .gLongitude(gym.getGLongitude())
                .gImageUrl(gym.getGImageUrl())
                .stations(stationResponses)
                .build();
    }

    /**
     * 특정 지점의 재직 중인 트레이너 목록 조회
     *
     * @param gId 지점 번호
     * @return 트레이너 목록
     */
    @Transactional(readOnly = true)
    public List<BranchTrainerResponse> getBranchTrainers(Long gId) {
        log.info("지점 트레이너 목록 조회 - gId: {}", gId);

        // 지점 존재 여부 확인
        if (!gymInfoRepository.existsById(gId)) {
            throw new IllegalArgumentException("존재하지 않는 지점입니다. gId=" + gId);
        }

        List<TrainerInfo> trainers = trainerInfoRepository.findByGIdAndEmployed(gId);

        return trainers.stream()
                .map(trainer -> BranchTrainerResponse.builder()
                        .tId(trainer.getTId())
                        .tName(trainer.getTName())
                        .tBio(trainer.getTAboutMe())
                        .tCareer(trainer.getTAwardTitle())
                        .tSpecialty(null) // TrainerInfo 엔티티에 specialty 필드 없음
                        .tImageUrl(trainer.getTImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 노선 번호 추출 (예: "2호선" → "2", "신분당선" → "신")
     */
    private String extractLineNumber(String lineNumber) {
        if (lineNumber == null || lineNumber.isBlank()) {
            return "";
        }

        // "2호선" → "2"
        if (lineNumber.matches("\\d+호선")) {
            return lineNumber.replaceAll("호선", "");
        }

        // "신분당선" → "신"
        // "공항철도" → "A"
        if (lineNumber.contains("공항")) {
            return "A";
        }
        if (lineNumber.contains("경의")) {
            return "K";
        }
        if (lineNumber.contains("신분당")) {
            return "S";
        }

        // 첫 글자 반환
        return lineNumber.substring(0, 1);
    }

    /**
     * 도보 시간 추출 (예: "도보 5분" → "5")
     */
    private String extractWalkTime(String walkingDistance) {
        if (walkingDistance == null || walkingDistance.isBlank()) {
            return "0";
        }

        // 숫자만 추출
        String numbers = walkingDistance.replaceAll("[^0-9]", "");
        return numbers.isEmpty() ? "0" : numbers;
    }
}
