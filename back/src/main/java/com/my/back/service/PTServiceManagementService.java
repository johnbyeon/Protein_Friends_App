package com.my.back.service;

import com.my.back.dto.PTServiceRequestDto;
import com.my.back.dto.PTServiceResponseDto;
import com.my.back.entity.PTService;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import com.my.back.repository.PTServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PTService Service - PT 이용권 관리 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PTServiceManagementService {

    private final PTServiceRepository ptServiceRepository;

    /**
     * PT 이용권 등록
     */
    @Transactional
    public PTServiceResponseDto createPTService(PTServiceRequestDto request) {
        LocalDateTime now = LocalDateTime.now();
        PTService ptService = PTService.builder()
                .ptName(request.getPtName())
                .ptPicUrl(request.getPtPicUrl())
                .ptCount(request.getPtCount())
                .ptDurationDays(request.getPtDurationDays())
                .ptPrice(request.getPtPrice())
                .ptSalePrice(request.getPtSalePrice())
                .isActive(request.getIsActive())
                .createdAt(now)
                .updateAt(now)
                .build();

        PTService savedService = ptServiceRepository.save(ptService);
        
        log.info("✅ PT 이용권 등록 완료 - ID: {}, 이름: {}", savedService.getPtId(), savedService.getPtName());
        
        return convertToResponseDto(savedService);
    }

    /**
     * PT 이용권 전체 조회
     */
    public List<PTServiceResponseDto> getAllPTServices() {
        return ptServiceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 활성화된 PT 이용권 조회
     */
    public List<PTServiceResponseDto> getActivePTServices() {
        return ptServiceRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * PT 이용권 수정
     */
    @Transactional
    public PTServiceResponseDto updatePTService(Long id, PTServiceRequestDto request) {
        PTService existingService = ptServiceRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PT_TICKET_NOT_FOUND));

        existingService.setPtName(request.getPtName());
        existingService.setPtPicUrl(request.getPtPicUrl());
        existingService.setPtCount(request.getPtCount());
        existingService.setPtDurationDays(request.getPtDurationDays());
        existingService.setPtPrice(request.getPtPrice());
        existingService.setPtSalePrice(request.getPtSalePrice());
        existingService.setIsActive(request.getIsActive());
        existingService.setUpdateAt(LocalDateTime.now());

        PTService updatedService = ptServiceRepository.save(existingService);
        
        log.info("✅ PT 이용권 수정 완료 - ID: {}, 이름: {}", updatedService.getPtId(), updatedService.getPtName());
        
        return convertToResponseDto(updatedService);
    }

    /**
     * PT 이용권 삭제
     */
    @Transactional
    public void deletePTService(Long id) {
        if (!ptServiceRepository.existsById(id)) {
            throw new ApiException(ErrorCode.PT_TICKET_NOT_FOUND);
        }
        
        ptServiceRepository.deleteById(id);
        
        log.info("✅ PT 이용권 삭제 완료 - ID: {}", id);
    }

    /**
     * 엔티티를 ResponseDto로 변환
     */
    private PTServiceResponseDto convertToResponseDto(PTService ptService) {
        return PTServiceResponseDto.builder()
                .ptId(ptService.getPtId())
                .ptPicUrl(ptService.getPtPicUrl())
                .ptName(ptService.getPtName())
                .ptCount(ptService.getPtCount())
                .ptDurationDays(ptService.getPtDurationDays())
                .ptPrice(ptService.getPtPrice())
                .ptSalePrice(ptService.getPtSalePrice())
                .isActive(ptService.getIsActive())
                .createdAt(ptService.getCreatedAt())
                .updateAt(ptService.getUpdateAt())
                .build();
    }
}