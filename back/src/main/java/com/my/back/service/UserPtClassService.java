package com.my.back.service;

import com.my.back.dto.ptclass.UserPtClassDtos;
import com.my.back.entity.ClassUserInfo;
import com.my.back.entity.PTClassInfo;
import com.my.back.entity.Users;
import com.my.back.repository.ClassUserInfoRepository;
import com.my.back.repository.PTClassInfoRepository;
import com.my.back.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserPtClassService {

    private final PTClassInfoRepository classRepo;
    private final ClassUserInfoRepository classUserRepo;
    private final SecurityUtil securityUtil;

    /** 전체 예약 가능한 클래스 조회 */
    public List<UserPtClassDtos.ClassItem> getAvailableClasses() {

        List<PTClassInfo> list = classRepo.findAvailableClasses();

        return list.stream()
                .map(c -> {
                    long reserved = classUserRepo.countByClassId(c.getPtClassId());
                    int capacity = c.getMaxCapacity();
                    int remaining = Math.max(0, capacity - (int) reserved);

                    return new UserPtClassDtos.ClassItem(
                            c.getPtClassId(),
                            c.getClassName(),
                            c.getClassContent(),
                            c.getStartDatetime(),
                            c.getEndDatetime(),
                            capacity,
                            (int) reserved,
                            remaining,
                            new UserPtClassDtos.TrainerInfo(
                                    c.getTrainer().getTId(),
                                    c.getTrainer().getTName()
                            )
                    );
                })
                .toList();
    }

    /** 내가 신청한 클래스 조회 */
    public List<UserPtClassDtos.MyClassItem> getMyClasses() {

        Long userId = securityUtil.getLoginUserId(); // JWT 로그인 적용 시 자동 주입

        List<ClassUserInfo> bookings = classUserRepo.findByUserId(userId);

        return bookings.stream()
                .map(b -> {
                    PTClassInfo c = b.getPtClassInfo();
                    return new UserPtClassDtos.MyClassItem(
                            c.getPtClassId(),
                            c.getClassName(),
                            c.getStartDatetime(),
                            c.getEndDatetime(),
                            new UserPtClassDtos.TrainerInfo(
                                    c.getTrainer().getTId(),
                                    c.getTrainer().getTName()
                            )
                    );
                })
                .toList();
    }
}
