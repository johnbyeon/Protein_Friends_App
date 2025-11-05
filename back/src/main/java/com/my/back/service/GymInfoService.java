package com.my.back.service;

import com.my.back.dto.gym.GymInfoDtos;
import com.my.back.entity.GymInfo;
import com.my.back.repository.GymInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GymInfoService {

    private final GymInfoRepository gymInfoRepository;

    /** 지점 등록 */
    public GymInfoDtos.Res createGym(GymInfoDtos.CreateReq req) {
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
        return toRes(saved);
    }

    /** 전체 조회 */
    public List<GymInfoDtos.Res> getAllGyms() {
        return gymInfoRepository.findAll()
                .stream()
                .map(this::toRes)
                .collect(Collectors.toList());
    }

    /** 단일 조회 */
    public GymInfoDtos.Res getGymById(Long id) {
        GymInfo gym = gymInfoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("지점을 찾을 수 없습니다. ID=" + id));
        return toRes(gym);
    }

    /** 수정 */
    public GymInfoDtos.Res updateGym(Long id, GymInfoDtos.UpdateReq req) {
        GymInfo gym = gymInfoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("지점을 찾을 수 없습니다. ID=" + id));

        gym.setGName(req.gName());
        gym.setGAddress(req.gAddress());
        gym.setGTel(req.gTel());
        gym.setGWorkoutDuration(req.gWorkoutDuration());
        gym.setGParking(req.gParking());
        gym.setGLatitude(req.gLatitude());
        gym.setGLongitude(req.gLongitude());
        gym.setGImageUrl(req.gImageUrl());

        GymInfo updated = gymInfoRepository.save(gym);
        return toRes(updated);
    }

    /** 삭제 */
    public void deleteGym(Long id) {
        gymInfoRepository.deleteById(id);
    }

    /** 엔티티 → 응답 DTO 변환 */
    private GymInfoDtos.Res toRes(GymInfo gym) {
        return new GymInfoDtos.Res(
                gym.getGId(),
                gym.getGName(),
                gym.getGAddress(),
                gym.getGTel(),
                gym.getGWorkoutDuration(),
                gym.getGParking(),
                gym.getGLatitude(),
                gym.getGLongitude(),
                gym.getGImageUrl()
        );
    }
}
