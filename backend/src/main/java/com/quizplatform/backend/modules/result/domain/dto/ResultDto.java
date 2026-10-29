package com.quizplatform.backend.modules.result.domain.dto;

import java.time.LocalDateTime;
import java.util.Map;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ResultDto {

    @Data
    public static class SubmitQuizRequest {
        @NotNull
        private Long quizId;

        @NotNull
        private Integer timeTakenSeconds;

        // Map<QuestionId, SelectedOptionId>
        @NotNull
        private Map<Long, Long> answers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizResultResponse {
        private Long id;
        private Long resultId;
        private Long quizId;
        private String quizTitle;
        private String categoryName;
        private Integer totalQuestions;
        private Integer correctAnswers;
        private Integer score;
        private Integer timeTakenSeconds;
        private Integer timeSpentSeconds;
        private Boolean isPassed;
        private Boolean passed;
        private Double percentage;
        private String completedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResultHistoryResponse {
        private Long id;
        private Long quizId;
        private String quizTitle;
        private String categoryName;
        private Integer score;
        private Integer totalQuestions;
        private Integer correctAnswers;
        private Double percentage;
        private Boolean passed;
        private Boolean isPassed;
        private String completedAt;
        private Integer timeSpentSeconds;
        private Integer timeTakenSeconds;
    }
}