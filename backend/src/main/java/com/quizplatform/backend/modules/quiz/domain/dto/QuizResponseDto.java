package com.quizplatform.backend.modules.quiz.domain.dto;

import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.quiz.domain.entity.Question;
import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class QuizResponseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
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
    public static class QuestionPublicResponse {
        private Long id;
        private String content;
        private String codeSnippet;
        private Integer points;
        private List<OptionPublicResponse> options; // isCorrect YO'Q!
    }

    @Data
    public static class OptionPublicResponse {
        private Long id;
        private String optionText;
        // isCorrect MAYDONI BU YERGA YOZILMAYDI!
    }

    @Data
    public static class CategoryResponseDto {
        private Long id;
        private String name;
        private String description;
        private String iconUrl;
    }
}