package com.my.back.repository;

import com.my.back.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 답변 Repository
 */
@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    /**
     * 질문 ID로 답변 조회
     */
    @Query("SELECT a FROM Answer a WHERE a.question.qId = :qId")
    Optional<Answer> findByQuestion_QId(@Param("qId") Long qId);
}

