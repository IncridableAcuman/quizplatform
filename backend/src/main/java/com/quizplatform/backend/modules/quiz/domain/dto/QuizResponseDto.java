package com.quizplatform.backend.modules.quiz.domain.dto;

import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class QuizResponseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizSummaryResponse {
        private Long id;
        private String title;
        private String description;
        private Quiz.Difficulty difficulty;
        private Integer timeLimitMinutes;
        private Integer passingScore;
        private CategoryResponseDto category;
        private Integer questionsCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizPublicResponse {
        private Long id;
        private String title;
        private String description;
        private Quiz.Difficulty difficulty;
        private Integer timeLimitMinutes;
        private Integer passingScore;
        private CategoryResponseDto category;
        private List<QuestionPublicResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionPublicResponse {
        private Long id;
        private String content;
        private String codeSnippet;
        private Integer points;
        private List<OptionPublicResponse> options; // isCorrect YO'Q!
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionPublicResponse {
        private Long id;
        private String optionText;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizAdminResponse {
        private Long id;
        private String title;
        private String description;
        private Quiz.Difficulty difficulty;
        private Integer timeLimitMinutes;
        private Integer passingScore;
        private CategoryResponseDto category;
        private List<QuestionAdminResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionAdminResponse {
        private Long id;
        private String content;
        private String codeSnippet;
        private Integer points;
        private List<OptionAdminResponse> options;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OptionAdminResponse {
        private Long id;
        private String optionText;
        private Boolean isCorrect;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryResponseDto {
        private Long id;
        private String name;
        private String description;
        private String iconUrl;
    }
}