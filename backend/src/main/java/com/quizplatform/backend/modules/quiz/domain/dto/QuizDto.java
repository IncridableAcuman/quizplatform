package com.quizplatform.backend.modules.quiz.domain.dto;


import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

public class QuizDto {

    @Data
    public static class CategoryRequest {
        @NotBlank private String name;
        private String description;
        private String iconUrl;
        private Long parentId;
    }

    @Data
    public static class OptionRequest {
        private Long id;
        @NotBlank private String optionText;
        @NotNull private Boolean isCorrect;
    }

    @Data
    public static class QuestionRequest {
        private Long id;
        @NotBlank private String content;
        private String codeSnippet;
        private Integer points = 10;
        private List<OptionRequest> options;
    }

    @Data
    public static class QuizRequest {
        @NotBlank private String title;
        private String description;
        @NotNull private Long categoryId;
        @NotNull private Quiz.Difficulty difficulty;
        @NotNull private Integer timeLimitMinutes;
        @NotNull private Integer passingScore;
        private List<QuestionRequest> questions;
    }
}
