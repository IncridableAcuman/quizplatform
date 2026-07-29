package com.quizplatform.backend.modules.result.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

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
    public static class QuizResultResponse {
        private Long resultId;
        private String quizTitle;
        private Integer totalQuestions;
        private Integer correctAnswers;
        private Integer score;
        private Integer timeTakenSeconds;
        private Boolean isPassed;
        private String completedAt;
    }
}