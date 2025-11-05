package com.my.back.repository;

import com.my.back.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 1:1 문의 Repository
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    /**
     * 답변이 없는 문의 목록 조회 (미답변)
     */
    @Query("SELECT q FROM Question q WHERE NOT EXISTS " +
           "(SELECT a FROM Answer a WHERE a.question.qId = q.qId) " +
           "ORDER BY q.qCreateDate DESC")
    Page<Question> findUnansweredQuestions(Pageable pageable);

    /**
     * 답변이 있는 문의 목록 조회 (답변완료)
     */
    @Query("SELECT q FROM Question q WHERE EXISTS " +
           "(SELECT a FROM Answer a WHERE a.question.qId = q.qId) " +
           "ORDER BY q.qCreateDate DESC")
    Page<Question> findAnsweredQuestions(Pageable pageable);

    /**
     * 특정 유저의 문의 목록 조회 (최신순)
     */
    @Query("SELECT q FROM Question q WHERE q.users.uId = :userId ORDER BY q.qCreateDate DESC")
    Page<Question> findByUsers_UIdOrderByQCreateDateDesc(@Param("userId") Long userId, Pageable pageable);
}

