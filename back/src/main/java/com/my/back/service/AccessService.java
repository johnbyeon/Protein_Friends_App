package com.my.back.service;

import com.my.back.dto.AccessRequest;
import com.my.back.dto.AccessResponse;
import com.my.back.dto.ActiveAccessDto;
import com.my.back.dto.GymLocationResponse;
import com.my.back.entity.AccessDirection;
import com.my.back.entity.AccessLog;
import com.my.back.entity.GymInfo;
import com.my.back.repository.AccessLogRepository;
import com.my.back.repository.GymInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ==============================================================
 * 🔹 AccessService - 출입 관리 서비스
 * ==============================================================
 * ✅ 핵심 기능
 *  1) 지점 목록 조회 (현재 인원 포함)
 *  2) 입장 처리 (IN)
 *     - 이미 입장 중인 경우 차단
 *  3) 퇴장 처리 (OUT)
 *     - 입장하지 않은 경우 차단
 *
 * 📌 비즈니스 규칙
 *  - 한 회원은 동시에 한 지점에만 입장 가능
 *  - 입장 없이 퇴장 불가
 *  - 현재 인원은 (IN 카운트 - OUT 카운트)로 계산
 * ==============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AccessService {

    private final GymInfoRepository gymInfoRepository;
    private final AccessLogRepository accessLogRepository;
    @Transactional(readOnly = true)
    public ActiveAccessDto getActiveAccess(Long uId) {
        return accessLogRepository.findTop1ByuIdOrderByAccessTimeDesc(uId)
                .map(last -> {
                    boolean active = last.getAccessDirection() == AccessDirection.IN;
                    Long gId = active ? last.getGId() : null;
                    return new ActiveAccessDto(active, gId, last.getAccessDirection(), last.getAccessTime());
                })
                .orElse(new ActiveAccessDto(false, null, null, null));
    }
    /**
     * 전체 지점 목록 조회 (현재 인원 포함)
     *
     * @return 지점 목록 (지점번호, 지점명, 현재인원)
     */
    @Transactional(readOnly = true)
    public List<GymLocationResponse> getAllGymLocationsWithCapacity() {
        log.info("전체 지점 목록 조회 시작");

        List<GymInfo> gymList = gymInfoRepository.findAll();

        return gymList.stream()
                .map(gym -> {
                    Integer currentCapacity = accessLogRepository.getCurrentCapacity(gym.getGId());
                    // null인 경우 0으로 처리 (입출입 기록이 없는 경우)
                    if (currentCapacity == null) {
                        currentCapacity = 0;
                    }

                    return GymLocationResponse.builder()
                            .gId(gym.getGId())
                            .gName(gym.getGName())
                            .currentCapacity(currentCapacity)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 특정 지점의 현재 인원 조회
     *
     * @param gId 지점 번호
     * @return 현재 인원
     */
    @Transactional(readOnly = true)
    public Integer getCurrentCapacity(Long gId) {
        log.info("지점 {} 현재 인원 조회", gId);

        // 지점 존재 여부 확인
        GymInfo gym = gymInfoRepository.findById(gId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다. gId=" + gId));

        Integer capacity = accessLogRepository.getCurrentCapacity(gId);
        return capacity != null ? capacity : 0;
    }

    /**
     * 입장 처리 (IN)
     *
     * @param uId 회원 번호
     * @param request 입장 요청 (지점 번호)
     * @return 입장 응답
     */
    @Transactional
    public AccessResponse processEntry(Long uId, AccessRequest request) {
        log.info("회원 {} 입장 처리 시작 - 지점: {}", uId, request.getGId());

        Long gId = request.getGId();

        // 1. 지점 존재 여부 확인
        GymInfo gym = gymInfoRepository.findById(gId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다. gId=" + gId));

        // 2. 이미 입장 중인지 확인
        Optional<AccessLog> lastAccessOpt = accessLogRepository.findTop1ByUIdAndGIdOrderByAccessTimeDesc(uId, gId);

        if (lastAccessOpt.isPresent()) {
            AccessLog lastAccess = lastAccessOpt.get();
            if (lastAccess.getAccessDirection() == AccessDirection.IN) {
                throw new IllegalStateException("이미 입장 중입니다. 먼저 퇴장해주세요.");
            }
        }

        // 3. 입장 로그 생성
        AccessLog newLog = AccessLog.builder()
                .uId(uId)
                .gId(gId)
                .accessDirection(AccessDirection.IN)
                .accessTime(LocalDateTime.now())
                .build();

        AccessLog savedLog = accessLogRepository.save(newLog);
        log.info("입장 로그 생성 완료 - aId: {}", savedLog.getAId());

        // 4. 응답 생성
        return AccessResponse.builder()
                .aId(savedLog.getAId())
                .gId(gId)
                .gName(gym.getGName())
                .uId(uId)
                .accessDirection(AccessDirection.IN)
                .accessTime(savedLog.getAccessTime())
                .message(gym.getGName() + "에 입장하셨습니다.")
                .build();
    }

    /**
     * 퇴장 처리 (OUT)
     *
     * @param uId 회원 번호
     * @param request 퇴장 요청 (지점 번호)
     * @return 퇴장 응답
     */
    @Transactional
    public AccessResponse processExit(Long uId, AccessRequest request) {
        log.info("회원 {} 퇴장 처리 시작 - 지점: {}", uId, request.getGId());

        Long gId = request.getGId();

        // 1. 지점 존재 여부 확인
        GymInfo gym = gymInfoRepository.findById(gId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다. gId=" + gId));

        // 2. 입장 중인지 확인
        Optional<AccessLog> lastAccessOpt = accessLogRepository.findTop1ByUIdAndGIdOrderByAccessTimeDesc(uId, gId);

        if (lastAccessOpt.isEmpty()) {
            throw new IllegalStateException("입장 기록이 없습니다. 먼저 입장해주세요.");
        }

        AccessLog lastAccess = lastAccessOpt.get();
        if (lastAccess.getAccessDirection() == AccessDirection.OUT) {
            throw new IllegalStateException("입장 기록이 없습니다. 먼저 입장해주세요.");
        }

        // 3. 퇴장 로그 생성
        AccessLog newLog = AccessLog.builder()
                .uId(uId)
                .gId(gId)
                .accessDirection(AccessDirection.OUT)
                .accessTime(LocalDateTime.now())
                .build();

        AccessLog savedLog = accessLogRepository.save(newLog);
        log.info("퇴장 로그 생성 완료 - aId: {}", savedLog.getAId());

        // 4. 응답 생성
        return AccessResponse.builder()
                .aId(savedLog.getAId())
                .gId(gId)
                .gName(gym.getGName())
                .uId(uId)
                .accessDirection(AccessDirection.OUT)
                .accessTime(savedLog.getAccessTime())
                .message(gym.getGName() + "에서 퇴장하셨습니다.")
                .build();
    }
}
