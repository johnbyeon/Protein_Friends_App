package com.my.back.service;

import com.my.back.dto.review.ReviewDtos.CreateReq;
import com.my.back.dto.review.ReviewDtos.Res;
import com.my.back.dto.review.ReviewDtos.UpdateReq;
import com.my.back.entity.TrainerInfo;
import com.my.back.entity.TrainerReview;
import com.my.back.entity.Users;
import com.my.back.repository.TrainerInfoRepository;
import com.my.back.repository.TrainerReviewRepository;
import com.my.back.repository.UserRepository;
//import com.my.back.repository.PtSessionRepository; // ✅ PT 수강이력 repo (경로 너가 맞춰)
import com.my.back.security.SecurityUtil; // ✅ JWT 로그인 유저 가져오는 util (경로 너가 맞춰)
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 트레이너 리뷰 서비스
 * 리뷰 생성/조회/수정/삭제 처리
 * JWT 인증 + PT 수강 이력 검증 포함
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TrainerReviewService {

    private final TrainerReviewRepository reviewRepo;
    private final TrainerInfoRepository trainerRepo;
    private final UserRepository userRepo;
    private final SecurityUtil securityUtil;
//    private final PtSessionRepository ptSessionRepo; // ✅ PT 수업 기록 확인

    /** 리뷰 생성 */
    public Res create(CreateReq req) {
        Long loginUserId = securityUtil.getLoginUserId(); // ✅ JWT 인증 유저 ID

        validateRating(req.rating());

        TrainerInfo trainer = trainerRepo.findById(req.trainerId())
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + req.trainerId()));

        if (Boolean.FALSE.equals(trainer.getIsEmployed())) {
            throw new IllegalStateException("Cannot review inactive trainer: " + req.trainerId());
        }

//        // ✅ PT 수업 이력 없는 사람은 리뷰 불가
//        boolean attendedPT = ptSessionRepo.existsByUIdAndTId(loginUserId, req.trainerId());
//        if (!attendedPT) {
//            throw new IllegalStateException("PT 수업 이력이 있는 회원만 리뷰를 작성할 수 있습니다.");
//        }

        Users user = userRepo.findById(loginUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + loginUserId));

        TrainerReview review = TrainerReview.builder()
                .tId(req.trainerId())
                .uId(loginUserId)   // ✅ body에서 userId 안받음, JWT로 처리
                .rating(req.rating())
                .reviewText(req.reviewText())
                .build();

        review.setCreateAt(LocalDateTime.now());

        TrainerReview saved = reviewRepo.save(review);
        saved.setReviewer(user);

        return toRes(saved);
    }

    /** 트레이너 리뷰 목록 */
    @Transactional(readOnly = true)
    public Page<Res> listByTrainer(Long trainerId, int page, int size) {
        trainerRepo.findById(trainerId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found: " + trainerId));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createAt"));
        return reviewRepo.findBytId(trainerId, pageable).map(this::toRes);
    }

    /** 리뷰 수정 (본인만 가능) */
    public Res update(Long reviewId, UpdateReq req) {
        Long loginUserId = securityUtil.getLoginUserId();

        TrainerReview review = reviewRepo.findByrId(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        // ✅ 본인 확인
        if (!review.getUId().equals(loginUserId)) {
            throw new IllegalStateException("본인 리뷰만 수정할 수 있습니다.");
        }

        if (req.rating() != null) {
            validateRating(req.rating());
            review.setRating(req.rating());
        }
        if (req.reviewText() != null) {
            review.setReviewText(req.reviewText());
        }

        TrainerReview saved = reviewRepo.save(review);
        return toRes(saved);
    }

    /** 리뷰 삭제 (본인만 가능) */
    public void delete(Long reviewId) {
        Long loginUserId = securityUtil.getLoginUserId();

        TrainerReview review = reviewRepo.findByrId(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));

        // ✅ 본인 확인
        if (!review.getUId().equals(loginUserId)) {
            throw new IllegalStateException("본인 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepo.delete(review);
    }

    /** 평점 검증 */
    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }
    }

    /** Entity → DTO */
    private Res toRes(TrainerReview review) {
        Users reviewer = review.getReviewer();
        return new Res(
                review.getRId(),
                review.getTId(),
                review.getUId(),
                reviewer != null ? reviewer.getName() : null,
                reviewer != null ? reviewer.getProfilePicture() : null,
                review.getRating(),
                review.getReviewText(),
                review.getCreateAt()
        );
    }
}
