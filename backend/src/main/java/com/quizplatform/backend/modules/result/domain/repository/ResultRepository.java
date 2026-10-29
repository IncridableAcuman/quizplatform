package com.quizplatform.backend.modules.result.domain.repository;

import com.quizplatform.backend.modules.result.domain.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result,Long> {
    List<Result> findByUserId(Long userId);
    List<Result> findByUserIdOrderByCompletedAtDesc(Long userId);
    // Muayyan vaqt oralig'ida (Kunlik / Haftalik) eng ko'p ball toplagan top foydalanuvchilar
    @Query("""
        SELECT r.user.id AS userId, r.user.username AS username, r.user.fullName AS fullName, 
               SUM(r.score) AS totalPeriodScore, COUNT(r.id) AS totalQuizzes 
        FROM Result r 
        WHERE r.completedAt >= :startDate 
        GROUP BY r.user.id, r.user.username, r.user.fullName 
        ORDER BY totalPeriodScore DESC
    """)
    List<Object[]> findTopUsersByPeriod(@Param("startDate") LocalDateTime startDate);

    // Foydalanuvchining o'tgan testlari va ko'rsatkichlari bo'yicha agregatsiya
    @Query("""
        SELECT COUNT(r.id), 
               SUM(CASE WHEN r.isPassed = true THEN 1 ELSE 0 END),
               AVG(r.timeTakenSeconds),
               SUM(r.correctAnswers),
               SUM(r.totalQuestions)
        FROM Result r 
        WHERE r.user.id = :userId
    """)
    List<Object[]> getUserAggregatedStats(@Param("userId") Long userId);
}
