package com.my.back.service;

import com.my.back.dto.common.PageResponse;
import com.my.back.dto.gym.GymReviewDtos;
import com.my.back.entity.GymReview;
import com.my.back.entity.GymReviewId;
import com.my.back.exception.ApiException;
import com.my.back.exception.ErrorCode;
import com.my.back.repository.GymInfoRepository;
import com.my.back.repository.GymReviewRepository;
import com.my.back.repository.MembershipLogRepository;
import com.my.back.repository.PtInfoRepository;
import com.my.back.repository.projection.GymReviewView;
import com.my.back.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GymReviewService {

    private final GymInfoRepository gymInfoRepository;
    private final GymReviewRepository gymReviewRepository;
    private final MembershipLogRepository membershipLogRepository;
    private final PtInfoRepository ptInfoRepository;
    private final SecurityUtil securityUtil;

    // 리뷰 리스트 조회
    public PageResponse<GymReviewDtos.GymReviewItem> getGymReviews(Long gId, int page, int size) {
        validateGymExists(gId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<GymReviewView> reviews = gymReviewRepository.findReviewsByGymId(gId, pageable);

        Page<GymReviewDtos.GymReviewItem> mapped = reviews.map(r ->
                new GymReviewDtos.GymReviewItem(
                        r.uId(),
                        r.userNickname(),
                        r.gRating(),
                        r.gReview(),
                        r.createdAt()
                ));

        return PageResponse.from(mapped);
    }

    // 단일 리뷰 조회
    public GymReviewDtos.GymReviewItem getGymReview(Long gId, Long uId) {
        GymReview review = gymReviewRepository.findById(new GymReviewId(gId, uId))
                .orElseThrow(() -> new ApiException(ErrorCode.GYM_REVIEW_NOT_FOUND));

        return new GymReviewDtos.GymReviewItem(
                review.getUId(),
                review.getReviewer().getName(),
                review.getGRating(),
                review.getGReview(),
                review.getCreatedAt()
        );
    }

    // 리뷰 작성
    @Transactional
    public void createGymReview(Long gId, GymReviewDtos.CreateGymReviewReq req) {
        validateGymExists(gId);
        Long userId = securityUtil.getLoginUserId();

        if (!hasUsageHistory(userId, gId))
            throw new ApiException(ErrorCode.GYM_REVIEW_FORBIDDEN);

        if (gymReviewRepository.existsReview(gId, userId))
            throw new ApiException(ErrorCode.GYM_REVIEW_CONFLICT);

        gymReviewRepository.save(GymReview.builder()
                .gId(gId)
                .uId(userId)
                .gRating(req.gRating())
                .gReview(req.gReview())
                .createdAt(LocalDateTime.now())
                .build());
    }

    // 리뷰 수정
    @Transactional
    public void updateGymReview(Long gId, GymReviewDtos.CreateGymReviewReq req) {
        Long userId = securityUtil.getLoginUserId();

        GymReview review = gymReviewRepository.findById(new GymReviewId(gId, userId))
                .orElseThrow(() -> new ApiException(ErrorCode.GYM_REVIEW_NOT_FOUND));

        review.update(req.gRating(), req.gReview());
    }

    // 리뷰 삭제
    @Transactional
    public void deleteGymReview(Long gId) {
        Long userId = securityUtil.getLoginUserId();

        GymReview review = gymReviewRepository.findById(new GymReviewId(gId, userId))
                .orElseThrow(() -> new ApiException(ErrorCode.GYM_REVIEW_NOT_FOUND));

        gymReviewRepository.delete(review);
    }

    private boolean hasUsageHistory(Long userId, Long gId) {
        return membershipLogRepository.hasUsageHistory(userId, gId)
                || ptInfoRepository.hasUsageHistory(userId, gId);
    }

    private void validateGymExists(Long gId) {
        if (!gymInfoRepository.existsById(gId))
            throw new ApiException(ErrorCode.GYM_NOT_FOUND);
    }
}
