package com.my.back.controller;

import com.my.back.dto.gym.GymInfoDtos;
import com.my.back.service.GymInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/gyms")
@RequiredArgsConstructor
public class GymInfoController {

    private final GymInfoService gymInfoService;

    /** 등록 */
    @PostMapping
    public ResponseEntity<GymInfoDtos.Res> createGym(@RequestBody GymInfoDtos.CreateReq req) {
        return ResponseEntity.ok(gymInfoService.createGym(req));
    }

    /** 전체 조회 */
    @GetMapping
    public ResponseEntity<List<GymInfoDtos.Res>> getAllGyms() {
        return ResponseEntity.ok(gymInfoService.getAllGyms());
    }

    /** 단일 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<GymInfoDtos.Res> getGymById(@PathVariable Long id) {
        return ResponseEntity.ok(gymInfoService.getGymById(id));
    }

    /** 수정 */
    @PutMapping("/{id}")
    public ResponseEntity<GymInfoDtos.Res> updateGym(@PathVariable Long id, @RequestBody GymInfoDtos.UpdateReq req) {
        return ResponseEntity.ok(gymInfoService.updateGym(id, req));
    }

    /** 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGym(@PathVariable Long id) {
        gymInfoService.deleteGym(id);
        return ResponseEntity.noContent().build();
    }
}
