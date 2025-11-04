// 📂 src/main/java/com/my/back/service/MyInfoService.java
package com.my.back.service;

import com.my.back.dto.ChangePasswordRequest;
import com.my.back.dto.MyInfoResponse;
import com.my.back.dto.UpdateMyInfoRequest;
import com.my.back.entity.GymInfo;
import com.my.back.entity.SocialAccount;
import com.my.back.entity.UserInfo;
import com.my.back.entity.Users;
import com.my.back.repository.GymInfoRepository;
import com.my.back.repository.UserInfoRepository;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * ==============================================================
 * 🔹 MyInfoService — 인포(내 정보) 서비스 (최종 주석판)
 * ==============================================================
 * ✅ 핵심 포인트
 *  1) 조회/수정/비번변경이 모두 같은 로더(loadUserByEmailOrThrow)를 사용 → 일관성/안전성
 *  2) null-safe 업데이트: Users + UserInfo 부분 갱신
 *  3) @MapsId 구조 보정: u.setUserInfo(info) & info.setUsers(u) 양방향 보장
 *  4) 명확한 오류 메세지: IllegalArgumentException/IllegalStateException 활용
 *  5) Controller 단에서는 @AuthenticationPrincipal(expression="username") 로 email 공급
 *     (JWTFilter 가 principal 을 email 문자열로 세팅)
 *
 * 📌 Repository 요구사항
 *  - UserRepository.findWithUserInfoAndSocialAccountsByEmail(String email)
 *    : Users + UserInfo + SocialAccount 를 fetch/join 해서 NullPointer 방지.
 * ==============================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MyInfoService {

    // ----------------------------------------------------------
    // ✅ 의존성
    // ----------------------------------------------------------
    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;
    private final PasswordEncoder passwordEncoder;
    private final GymInfoRepository gymInfoRepository; // 선택 (주입되지 않으면 지점명 null)

    // 생년월일 포맷 (스레드 세이프)
    private static final DateTimeFormatter BIRTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ----------------------------------------------------------
    // ✅ 공통 로더: 모든 진입점에서 Users 조회를 '통일'
    // ----------------------------------------------------------
    private Users loadUserByEmailOrThrow(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new IllegalArgumentException("인증 정보가 없습니다 (email 없음).");
        }
        final String email = rawEmail.trim();
        Users u = userRepository.findWithUserInfoAndSocialAccountsByEmail(email);
        if (u == null) {
            throw new IllegalArgumentException("유저를 찾을 수 없습니다. email=" + email);
        }
        return u;
    }

    // ----------------------------------------------------------
    // ✅ 내 정보 조회
    //  - Users + UserInfo + Social providers + (선택) 지점명
    // ----------------------------------------------------------
    @Transactional(readOnly = true)
    public MyInfoResponse getMyInfoByEmail(String email) {
        Users u = loadUserByEmailOrThrow(email);
        UserInfo info = u.getUserInfo();

        // 소셜 제공자 리스트 추출 (null-safe)
        List<String> providers = extractProviderNamesSafely(u);

        // 지점명 (Repository 주입 시에만)
        String gymName = null;
        if (info != null && info.getGId() != null && gymInfoRepository != null) {
            GymInfo g = gymInfoRepository.findById(info.getGId()).orElse(null);
            gymName = (g != null) ? g.getGName() : null;
        }

        return MyInfoResponse.builder()
                // Users 기본
                .uId(u.getUId())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .name(u.getName())
                .phone(u.getPhone())
                // UserInfo 확장
                .gender(info != null ? info.getGender() : null)
                .address(info != null ? info.getAddress() : null)
                .birthDay(info != null && info.getBirthDay() != null ? info.getBirthDay().format(BIRTH_FMT) : null)
                .gId(info != null ? info.getGId() : null)
                .gymName(gymName)
                .height(info != null ? info.getHeight() : null)
                .weight(info != null ? info.getWeight() : null)
                .infoCreatedAt(info != null ? info.getCreateAt() : null)
                .infoUpdatedAt(info != null ? info.getUpdateAt() : null)
                // 소셜
                .socialProviders(providers)
                .build();
    }

    // ----------------------------------------------------------
    // ✅ 내 정보 저장(부분 업데이트)
    //  - null 값은 무시, non-null 만 반영
    //  - @MapsId 구조일 때 Users<->UserInfo 양방향 보정
    //  - Cascade 없으면 UserInfo 저장 보조
    // ----------------------------------------------------------
    @Transactional
    public MyInfoResponse updateMyInfo(String email, UpdateMyInfoRequest req) {
        Users u = loadUserByEmailOrThrow(email);

        // Users 변경
        if (req.getName()  != null) u.setName(req.getName());
        if (req.getPhone() != null) u.setPhone(req.getPhone());

        // UserInfo 가져오거나 생성
        UserInfo info = u.getUserInfo();
        if (info == null) {
            info = new UserInfo();
            info.setUsers(u);     // @MapsId: PK 공유
            u.setUserInfo(info);  // 양방향 보정
        }

        // UserInfo 변경
        if (req.getGender()  != null) info.setGender(req.getGender());
        if (req.getAddress() != null) info.setAddress(req.getAddress());
        if (req.getGId()     != null) info.setGId(req.getGId());
        if (req.getHeight() != null && !req.getHeight().isBlank()) {
            info.setHeight(req.getHeight().trim());
        }
        if (req.getWeight() != null && !req.getWeight().isBlank()) {
            info.setWeight(req.getWeight().trim());
        }

        if (req.getBirthDay() != null && !req.getBirthDay().isBlank()) {
            try {
                info.setBirthDay(LocalDate.parse(req.getBirthDay(), BIRTH_FMT));
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("birthDay는 yyyy-MM-dd 형식이어야 합니다.");
            }
        }

        // 저장
        userRepository.save(u);                // 변경 감지 트리거


        return getMyInfoByEmail(email);
    }

    // ----------------------------------------------------------
    // ✅ 비밀번호 변경 (로컬 계정 전용)
    //  - 소셜 전용 계정은 차단
    //  - 현재 비밀번호 검증 후 새 비밀번호로 교체
    // ----------------------------------------------------------
    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        Users u = loadUserByEmailOrThrow(email);

        // 소셜 전용 계정(비번 없음) 차단
        if (u.getPassword() == null || u.getPassword().isBlank()) {
            throw new IllegalStateException("소셜 가입 계정은 비밀번호를 변경할 수 없습니다.");
        }

        // 현재 비밀번호 필수
        String current = req.getCurrentPassword();
        if (current == null || current.isBlank()) {
            throw new IllegalArgumentException("currentPassword(또는 oldPassword)가 필요합니다.");
        }

        // 현재 비밀번호 검증
        if (!passwordEncoder.matches(current, u.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        // 새 비밀번호 검증(정책 필요 시 추가)
        String next = req.getNewPassword();
        if (next == null || next.isBlank()) {
            throw new IllegalArgumentException("newPassword가 필요합니다.");
        }
        // 예) if (next.length() < 8) throw new IllegalArgumentException("새 비밀번호는 8자 이상이어야 합니다.");

        // 저장
        u.setPassword(passwordEncoder.encode(next));
        userRepository.save(u); // 명시 저장(변경감지로도 가능하지만 안전하게 저장)
    }

    // ----------------------------------------------------------
    // 🔹 내부 유틸 — 소셜 provider 이름 리스트 추출 (null-safe, dedup)
    // ----------------------------------------------------------
    @SuppressWarnings({"rawtypes", "unchecked"})
    private List<String> extractProviderNamesSafely(Users u) {
        Object rawList = (u != null) ? u.getSocialAccounts() : null;
        if (!(rawList instanceof List<?> list) || list.isEmpty()) return List.of();

        Set<String> dedup = new LinkedHashSet<>();
        for (Object o : list) {
            if (o instanceof SocialAccount sa) {
                String p = sa.getProvider();
                if (p != null && !p.isBlank()) {
                    dedup.add(p.trim().toUpperCase(Locale.ROOT)); // 정규화 + 중복 제거
                }
            }
        }
        return new ArrayList<>(dedup);
    }
}
