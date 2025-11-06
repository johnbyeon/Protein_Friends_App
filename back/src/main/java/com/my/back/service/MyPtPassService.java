package com.my.back.service;

import com.my.back.dto.PtPassCardDto;
import com.my.back.entity.PtInfo;
import com.my.back.entity.PTService;
import com.my.back.entity.TrainerInfo;
import com.my.back.entity.Users;
import com.my.back.repository.PtInfoRepository;
import com.my.back.repository.PTServiceRepository;
import com.my.back.repository.TrainerInfoRepository;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ===============================================================
 * ✅ MyPtPassService — 내 PT 이용권 조회 서비스
 * ===============================================================
 * 🔹 주요 기능
 *   1) 전체 PT 이용권 조회
 *   2) 상태별 PT 이용권 조회
 * ===============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyPtPassService {

    private final PtInfoRepository ptInfoRepository;
    private final UserRepository userRepository;
    private final TrainerInfoRepository trainerInfoRepository;
    private final PTServiceRepository ptServiceRepository;

    // ---------------------------------------------------------
    // ✅ 1. 전체 PT 이용권 조회
    // ---------------------------------------------------------
    /**
     * 🔹 사용자의 모든 PT 이용권을 조회한다.
     *
     * @param userId 사용자 ID
     * @return PT 이용권 DTO 리스트
     */
    public List<PtPassCardDto> getAllPtPasses(Long userId) {
        // 사용자 확인
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // PT 이용권 조회
        List<PtInfo> ptInfos = ptInfoRepository.findByUsers_UIdAndStatusTrue(userId);

        return ptInfos.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // ✅ 2. 상태별 PT 이용권 조회
    // ---------------------------------------------------------
    /**
     * 🔹 상태에 따른 PT 이용권을 조회한다.
     *
     * @param userId 사용자 ID
     * @param status 상태값 (ACTIVE, EXPIRED 등)
     * @return PT 이용권 DTO 리스트
     */
    public List<PtPassCardDto> getPtPassesByStatus(Long userId, String status) {
        // 사용자 확인
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<PtInfo> ptInfos;

        switch (status.toUpperCase()) {
            case "ACTIVE":
                // 활성화된 PT 이용권 (남은 횟수가 있고, 기간 내)
                ptInfos = ptInfoRepository.findByUsers_UIdAndStatusTrue(userId).stream()
                        .filter(pt -> pt.getRemainingCount() > 0 && 
                                (pt.getEndDate() == null || pt.getEndDate().isAfter(LocalDate.now().minusDays(1))))
                        .collect(Collectors.toList());
                break;
            case "EXPIRED":
                // 만료된 PT 이용권 (남은 횟수가 없거나, 기간 지남)
                ptInfos = ptInfoRepository.findByUsers_UIdAndStatusTrue(userId).stream()
                        .filter(pt -> pt.getRemainingCount() <= 0 || 
                                (pt.getEndDate() != null && !pt.getEndDate().isAfter(LocalDate.now().minusDays(1))))
                        .collect(Collectors.toList());
                break;
            default:
                ptInfos = ptInfoRepository.findByUsers_UIdAndStatusTrue(userId);
                break;
        }

        return ptInfos.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------
    // ✅ 3. Entity → DTO 변환
    // ---------------------------------------------------------
    /**
     * 🔹 PtInfo 엔티티를 PtPassCardDto로 변환한다.
     *
     * @param ptInfo PT 이용권 엔티티
     * @return PT 이용권 DTO
     */
    private PtPassCardDto convertToDto(PtInfo ptInfo) {
        // 트레이너 정보 조회
        String trainerName = "";
        if (ptInfo.getTId() != null && ptInfo.getTId() > 0) {
            TrainerInfo trainer = trainerInfoRepository.findById(ptInfo.getTId()).orElse(null);
            if (trainer != null) {
                trainerName = trainer.getTName();
            }
        }

        // PT 서비스 정보 조회 (이미지 URL을 위해)
        String ptPicUrl = null;
        if (ptInfo.getPtId() != null) {
            log.info("🔍 [MyPtPassService] PT 서비스 조회 - ptId: {}", ptInfo.getPtId());
            PTService ptService = ptServiceRepository.findById(ptInfo.getPtId()).orElse(null);
            if (ptService != null) {
                ptPicUrl = ptService.getPtPicUrl();
                log.info("🔍 [MyPtPassService] PT 서비스 이미지 URL: {}", ptPicUrl);
            } else {
                log.warn("🔍 [MyPtPassService] PT 서비스를 찾을 수 없음 - ptId: {}", ptInfo.getPtId());
            }
        } else {
            log.warn("🔍 [MyPtPassService] ptId가 null임");
        }

        // 상태 결정
        String uiStatus = determineUiStatus(ptInfo);

        // 최종 가격 계산
        BigDecimal finalPrice = ptInfo.getPrice();
        if (ptInfo.getSalePrice() != null && ptInfo.getSalePrice().compareTo(BigDecimal.ZERO) > 0) {
            finalPrice = finalPrice.subtract(ptInfo.getSalePrice());
        }

        return PtPassCardDto.builder()
                .ptRecordId(ptInfo.getPtRecordId())
                .ptId(ptInfo.getPtId())
                .ptName(ptInfo.getPtName())
                .ptPicUrl(ptPicUrl)
                .ptTotalCount(ptInfo.getPtTotalCount())
                .remainingCount(ptInfo.getRemainingCount())
                .startDate(ptInfo.getStartDate())
                .endDate(ptInfo.getEndDate())
                .price(ptInfo.getPrice())
                .salePrice(ptInfo.getSalePrice())
                .finalPrice(finalPrice)
                .status(ptInfo.getStatus())
                .uiStatus(uiStatus)
                .trainerId(ptInfo.getTId())
                .trainerName(trainerName)
                .createdAt(ptInfo.getCreatedAt() != null ? ptInfo.getCreatedAt().toLocalDate() : null)
                .build();
    }

    // ---------------------------------------------------------
    // ✅ 4. UI 상태 결정
    // ---------------------------------------------------------
    /**
     * 🔹 PT 이용권의 UI 표시 상태를 결정한다.
     *
     * @param ptInfo PT 이용권 엔티티
     * @return UI 상태 문자열
     */
    private String determineUiStatus(PtInfo ptInfo) {
        if (!ptInfo.getStatus()) {
            return "취소됨";
        }

        if (ptInfo.getRemainingCount() <= 0) {
            return "횟수 소진";
        }

        if (ptInfo.getEndDate() != null && !ptInfo.getEndDate().isAfter(LocalDate.now().minusDays(1))) {
            return "기간 만료";
        }

        return "사용 중";
    }
}