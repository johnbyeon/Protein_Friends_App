package com.my.back.service;

import com.my.back.dto.PosMembershipRequestDto;
import com.my.back.dto.PosPtPassRequestDto;
import com.my.back.dto.PosResponseDto;
import com.my.back.entity.*;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import com.my.back.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ✅ PosService — 트레이너 현장 판매 서비스
 * ===============================================================
 * 🔹 주요 기능
 *   1) PT 이용권 현장 판매 처리
 *   2) 회원권 현장 판매 처리
 *   3) 트레이너 매출 기록
 * ===============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PosService {

    private final PtInfoRepository ptInfoRepository;
    private final MembershipLogRepository membershipLogRepository;
    private final MembershipServiceRepository membershipServiceRepository;
    private final UserRepository userRepository;
    private final TrainerInfoRepository trainerInfoRepository;

    /**
     * 🔹 PT 이용권 현장 판매
     */
    public PosResponseDto sellPtPass(String trainerEmail, PosPtPassRequestDto request) {
        // 1. 트레이너 정보 조회 (이메일로 Users 조회 후 TrainerInfo 조회)
        Users trainerUser = userRepository.findByEmail(trainerEmail);
        if (trainerUser == null) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }
        
        TrainerInfo trainer = trainerInfoRepository.findByuId(trainerUser.getUId())
                .orElseThrow(() -> new ApiException(ErrorCode.TRAINER_NOT_FOUND));

        // 2. 회원 정보 조회
        Users user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // 3. PT 정보 생성 및 저장 (현재 로그인한 트레이너 ID 사용)
        PtInfo ptInfo = PtInfo.builder()
                .ptId(request.getPtServiceId()) // PT 서비스 ID 사용
                .uId(request.getUserId())
                .tId(trainer.getTId()) // 현재 로그인한 트레이너 ID 사용
                .ptCol(0L)
                .ptName(request.getPtName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .ptTotalCount(request.getPtTotalCount())
                .remainingCount(request.getPtTotalCount())
                .status(true)
                .price(request.getPrice())
                .salePrice(request.getSalePrice())
                .createdAt(LocalDateTime.now()) // 생성일시 수동 설정
                .build();

        PtInfo savedPtInfo = ptInfoRepository.save(ptInfo);

        return PosResponseDto.builder()
                .recordId(savedPtInfo.getPtRecordId())
                .price(request.getPrice())
                .saleType("PT_PASS")
                .saleDate(LocalDateTime.now())
                .message("PT 이용권이 성공적으로 판매되었습니다.")
                .build();
    }

    /**
     * 🔹 회원권 현장 판매
     */
    public PosResponseDto sellMembership(String trainerEmail, PosMembershipRequestDto request) {
        // 1. 트레이너 정보 조회 (이메일로 Users 조회 후 TrainerInfo 조회)
        Users trainerUser = userRepository.findByEmail(trainerEmail);
        if (trainerUser == null) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }
        
        TrainerInfo trainer = trainerInfoRepository.findByuId(trainerUser.getUId())
                .orElseThrow(() -> new ApiException(ErrorCode.TRAINER_NOT_FOUND));

        // 2. 회원 정보 조회
        Users user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        // 3. 회원권 상품 정보 조회
        MembershipService membershipService = membershipServiceRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBERSHIP_NOT_FOUND));

        // 4. 회원권 로그 생성 및 저장
        MembershipLog membershipLog = MembershipLog.builder()
                .users(user)
                .trainer(trainer)
                .membershipId(request.getMembershipId())
                .membershipName(membershipService.getMembershipName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .price(request.getPrice())
                .salePrice(request.getSalePrice())
                .status(MembershipStatus.ACTIVE)
                .build();

        MembershipLog savedMembershipLog = membershipLogRepository.save(membershipLog);

        return PosResponseDto.builder()
                .recordId(savedMembershipLog.getMLogId())
                .price(BigDecimal.valueOf(request.getPrice()))
                .saleType("MEMBERSHIP")
                .saleDate(LocalDateTime.now())
                .message("회원권이 성공적으로 판매되었습니다.")
                .build();
    }
}