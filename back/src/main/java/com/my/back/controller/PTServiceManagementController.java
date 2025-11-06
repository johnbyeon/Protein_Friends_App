package com.my.back.controller;

import com.my.back.dto.PTServiceRequestDto;
import com.my.back.dto.PTServiceResponseDto;
import com.my.back.service.PTServiceManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * PTServiceManagementController — PT 이용권 관리 컨트롤러
 * ===============================================================
 * 🔹 주요 기능
 *   1) PT 이용권 등록         → POST /api/trainer/pt-services
 *   2) PT 이용권 전체 조회     → GET /api/trainer/pt-services
 *   3) PT 이용권 수정         → PUT /api/trainer/pt-services/{id}
 *   4) PT 이용권 삭제         → DELETE /api/trainer/pt-services/{id}
 * ===============================================================
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/trainer/pt-services")
@PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER')")
public class PTServiceManagementController {

    private final PTServiceManagementService ptServiceManagementService;

    /**
     * 🔹 PT 이용권 등록
     */
    @PostMapping
    public ResponseEntity<PTServiceResponseDto> createPTService(
            @Valid @RequestBody PTServiceRequestDto request
    ) {
        log.info("🏋️ [ADMIN/TRAINER] PT 이용권 등록 요청 - 이용권명: {}, 횟수: {}, 가격: {}", 
                request.getPtName(), request.getPtCount(), request.getPtPrice());

        PTServiceResponseDto response = ptServiceManagementService.createPTService(request);
        
        log.info("✅ [ADMIN/TRAINER] PT 이용권 등록 완료 - ID: {}", response.getPtId());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 🔹 PT 이용권 전체 조회
     */
    @GetMapping
    public ResponseEntity<List<PTServiceResponseDto>> getAllPTServices() {
        List<PTServiceResponseDto> services = ptServiceManagementService.getAllPTServices();
        return ResponseEntity.ok(services);
    }

    /**
     * 🔹 활성화된 PT 이용권 조회 (POS용)
     */
    @GetMapping("/active")
    public ResponseEntity<List<PTServiceResponseDto>> getActivePTServices() {
        List<PTServiceResponseDto> services = ptServiceManagementService.getActivePTServices();
        return ResponseEntity.ok(services);
    }

    /**
     * 🔹 PT 이용권 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<PTServiceResponseDto> updatePTService(
            @PathVariable Long id,
            @Valid @RequestBody PTServiceRequestDto request
    ) {
        log.info("🏋️ [ADMIN/TRAINER] PT 이용권 수정 요청 - ID: {}, 이용권명: {}", id, request.getPtName());

        PTServiceResponseDto response = ptServiceManagementService.updatePTService(id, request);
        
        log.info("✅ [ADMIN/TRAINER] PT 이용권 수정 완료 - ID: {}", response.getPtId());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 🔹 PT 이용권 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePTService(@PathVariable Long id) {
        log.info("🏋️ [ADMIN/TRAINER] PT 이용권 삭제 요청 - ID: {}", id);

        ptServiceManagementService.deletePTService(id);
        
        log.info("✅ [ADMIN/TRAINER] PT 이용권 삭제 완료 - ID: {}", id);
        
        return ResponseEntity.noContent().build();
    }
}