package com.my.back.service;

import com.my.back.dto.AnswerRequest;
import com.my.back.dto.QuestionRequest;
import com.my.back.dto.QuestionResponse;
import com.my.back.entity.Answer;
import com.my.back.entity.Question;
import com.my.back.entity.TrainerInfo;
import com.my.back.entity.Users;
import com.my.back.repository.AnswerRepository;
import com.my.back.repository.QuestionRepository;
import com.my.back.repository.TrainerInfoRepository;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 1:1 문의 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final TrainerInfoRepository trainerInfoRepository;
    private final UserRepository userRepository;

    /**
     * 문의 목록 조회 (미답변/답변완료 필터)
     */
    public Page<QuestionResponse> getQuestions(String status, Pageable pageable) {
        Page<Question> questions;
        
        if ("unanswered".equals(status)) {
            questions = questionRepository.findUnansweredQuestions(pageable);
        } else if ("answered".equals(status)) {
            questions = questionRepository.findAnsweredQuestions(pageable);
        } else {
            questions = questionRepository.findAll(pageable);
        }
        
        return questions.map(this::convertToResponse);
    }

    /**
     * 문의 상세 조회
     */
    public QuestionResponse getQuestion(Long qId) {
        Question question = questionRepository.findById(qId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다: " + qId));
        
        return convertToResponse(question);
    }

    /**
     * 내 문의 목록 조회 (유저용)
     */
    public Page<QuestionResponse> getMyQuestions(Long userId, Pageable pageable) {
        Page<Question> questions = questionRepository.findByUsers_UIdOrderByQCreateDateDesc(userId, pageable);
        return questions.map(this::convertToResponse);
    }

    /**
     * 문의 등록 (유저용)
     */
    @Transactional
    public QuestionResponse createQuestion(Long userId, QuestionRequest request) {
        // 유저 조회
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
        
        // 문의 생성
        Question question = Question.builder()
                .users(user)
                .qTitle(request.getQTitle())
                .qContent(request.getQContent())
                .qIsSecret(request.getQIsSecret() != null ? request.getQIsSecret() : false)
                .build();
        
        questionRepository.save(question);
        
        return convertToResponse(question);
    }

    /**
     * 답변 등록
     */
    @Transactional
    public QuestionResponse createAnswer(Long qId, Long trainerId, AnswerRequest request) {
        // 문의 조회
        Question question = questionRepository.findById(qId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다: " + qId));
        
        // 이미 답변이 있는지 확인
        if (answerRepository.findByQuestion_QId(qId).isPresent()) {
            throw new IllegalStateException("이미 답변이 등록되어 있습니다.");
        }
        
        // 트레이너 조회
        TrainerInfo trainer = trainerInfoRepository.findById(trainerId)
                .orElseThrow(() -> new IllegalArgumentException("트레이너를 찾을 수 없습니다: " + trainerId));
        
        // 답변 생성
        Answer answer = Answer.builder()
                .question(question)
                .trainer(trainer)
                .answer(request.getAnswer())
                .build();
        
        answerRepository.save(answer);
        
        return convertToResponse(question);
    }

    /**
     * 답변 수정
     */
    @Transactional
    public QuestionResponse updateAnswer(Long qId, Long trainerId, AnswerRequest request) {
        // 문의 조회
        Question question = questionRepository.findById(qId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다: " + qId));
        
        // 답변 조회
        Answer answer = answerRepository.findByQuestion_QId(qId)
                .orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다."));
        
        // 답변 수정
        answer.setAnswer(request.getAnswer());
        answerRepository.save(answer);
        
        return convertToResponse(question);
    }

    /**
     * Entity -> DTO 변환
     */
    private QuestionResponse convertToResponse(Question question) {
        Users user = question.getUsers();
        
        QuestionResponse response = QuestionResponse.builder()
                .qid(question.getQId())
                .uid(user.getUId())
                .username(user.getName())
                .useremail(user.getEmail())
                .qtitle(question.getQTitle())
                .qcontent(question.getQContent())
                .qissecret(question.getQIsSecret())
                .qcreatedate(question.getQCreateDate())
                .qupdatedate(question.getQUpdateDate())
                .build();
        
        // 답변 정보 추가 (있는 경우만)
        answerRepository.findByQuestion_QId(question.getQId()).ifPresent(answer -> {
            QuestionResponse.AnswerInfo answerInfo = QuestionResponse.AnswerInfo.builder()
                    .answerid(answer.getAnswerId())
                    .tid(answer.getTrainer().getTId())
                    .trainername(answer.getTrainer().getTName())
                    .answer(answer.getAnswer())
                    .createdate(answer.getCreateDate())
                    .updatedate(answer.getUpdateDate())
                    .readdate(answer.getReadDate())
                    .build();
            response.setAnswer(answerInfo);
        });
        
        return response;
    }

    /**
     * 사용자의 문의 목록 조회
     */
    public Page<QuestionResponse> getQuestionsByUser(String userEmail, Pageable pageable) {
        Users user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        
        Page<Question> questions = questionRepository.findByUsers_UIdOrderByQCreateDateDesc(user.getUId(), pageable);
        return questions.map(this::convertToResponse);
    }
}

