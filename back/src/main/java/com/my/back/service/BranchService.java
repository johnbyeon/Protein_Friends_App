package com.my.back.service;

import com.my.back.dto.BranchDetailResponse;
import com.my.back.dto.BranchStationResponse;
import com.my.back.dto.BranchTrainerResponse;
import com.my.back.dto.gym.GymInfoDtos;
import com.my.back.dto.gym.GymReviewDtos;
import com.my.back.entity.GymInfo;
import com.my.back.entity.GymStationInfo;
import com.my.back.entity.TrainerInfo;
import com.my.back.repository.GymInfoRepository;
import com.my.back.repository.GymStationInfoRepository;
import com.my.back.repository.TrainerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final GymReviewService gymReviewService;

    /**
     * 전체 지점 목록 조회 (주변 역 정보 포함)
     *
     * @param userDetails 사용자 정보 (권한 체크용)
     * @return 지점 목록
     */
    @Transactional(readOnly = true)
    public List<BranchDetailResponse> getAllBranches(UserDetails userDetails) {
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
     * 특정 지점 상세 조회 (공개)
     *
     * @param gId 지점 번호
     * @return 지점 상세 정보
     */
    @Transactional(readOnly = true)
    public BranchDetailResponse getBranchDetailPublic(Long gId) {
        log.info("지점 상세 조회 (공개) - gId: {}", gId);

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
     * 특정 지점 상세 조회 (인증 사용자용)
     *
     * @param gId 지점 번호
     * @param userDetails 사용자 정보 (권한 체크용)
     * @return 지점 상세 정보
     */
    @Transactional(readOnly = true)
    public BranchDetailResponse getBranchDetail(Long gId, UserDetails userDetails) {
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

    /**
     * 특정 지점의 리뷰 요약 조회
     *
     * @param gId 지점 번호
     * @return 리뷰 요약 (평균 별점, 총 개수, 리뷰 목록)
     */
    public GymReviewDtos.GymReviewListRes getBranchReviews(Long gId) {
        return gymReviewService.getGymReviewSummary(gId);
    }

    // =================================================================
    // 🔧 관리자용 CRUD 메서드
    // =================================================================

    /**
     * 지점 생성
     *
     * @param req 생성 요청
     * @return 생성된 지점 정보
     */
    @Transactional
    public BranchDetailResponse createBranch(GymInfoDtos.CreateReq req) {
        log.info("지점 생성 - 이름: {}", req.gName());

        // 지점 기본 정보 생성
        GymInfo gym = GymInfo.builder()
                .gName(req.gName())
                .gAddress(req.gAddress())
                .gTel(req.gTel())
                .gWorkoutDuration(req.gWorkoutDuration())
                .gParking(req.gParking())
                .gLatitude(req.gLatitude())
                .gLongitude(req.gLongitude())
                .gImageUrl(req.gImageUrl())
                .build();

        GymInfo saved = gymInfoRepository.save(gym);

        // stations 정보는 현재 프론트에서 처리하지 않으므로 빈 목록 반환
        return BranchDetailResponse.builder()
                .gId(saved.getGId())
                .gName(saved.getGName())
                .gAddress(saved.getGAddress())
                .gTel(saved.getGTel())
                .gWorkoutDuration(saved.getGWorkoutDuration())
                .gParking(saved.getGParking())
                .gLatitude(saved.getGLatitude())
                .gLongitude(saved.getGLongitude())
                .gImageUrl(saved.getGImageUrl())
                .stations(List.of()) // 빈 목록
                .build();
    }

    /**
     * 지점 수정
     *
     * @param gId 지점 번호
     * @param req 수정 요청
     * @return 수정된 지점 정보
     */
    @Transactional
    public BranchDetailResponse updateBranch(Long gId, GymInfoDtos.UpdateReq req) {
        log.info("지점 수정 - gId: {}, 이름: {}", gId, req.gName());

        GymInfo gym = gymInfoRepository.findById(gId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다. gId=" + gId));

        // 정보 업데이트
        gym.setGName(req.gName());
        gym.setGAddress(req.gAddress());
        gym.setGTel(req.gTel());
        gym.setGWorkoutDuration(req.gWorkoutDuration());
        gym.setGParking(req.gParking());
        gym.setGLatitude(req.gLatitude());
        gym.setGLongitude(req.gLongitude());
        gym.setGImageUrl(req.gImageUrl());

        GymInfo updated = gymInfoRepository.save(gym);

        // stations 정보 조회
        List<GymStationInfo> stations = gymStationInfoRepository.findByGId(gId);
        List<BranchStationResponse> stationResponses = stations.stream()
                .map(station -> BranchStationResponse.builder()
                        .stationName(station.getGStationName())
                        .stationLine(extractLineNumber(station.getGLineNumber()))
                        .walkTime(extractWalkTime(station.getGWalkingDistance()))
                        .build())
                .collect(Collectors.toList());

        return BranchDetailResponse.builder()
                .gId(updated.getGId())
                .gName(updated.getGName())
                .gAddress(updated.getGAddress())
                .gTel(updated.getGTel())
                .gWorkoutDuration(updated.getGWorkoutDuration())
                .gParking(updated.getGParking())
                .gLatitude(updated.getGLatitude())
                .gLongitude(updated.getGLongitude())
                .gImageUrl(updated.getGImageUrl())
                .stations(stationResponses)
                .build();
    }

    /**
     * 지점 삭제
     *
     * @param gId 지점 번호
     */
    @Transactional
    public void deleteBranch(Long gId) {
        log.info("지점 삭제 - gId: {}", gId);

        GymInfo gym = gymInfoRepository.findById(gId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다. gId=" + gId));

        // 관련 stations 정보도 삭제
        gymStationInfoRepository.findByGId(gId).forEach(station -> {
            gymStationInfoRepository.delete(station);
        });

        // 지점 삭제
        gymInfoRepository.delete(gym);
    }
}
