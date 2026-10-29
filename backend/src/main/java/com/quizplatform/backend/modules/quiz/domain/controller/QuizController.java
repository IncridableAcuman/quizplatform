package com.quizplatform.backend.modules.quiz.domain.controller;

import com.quizplatform.backend.modules.category.domain.dto.CategoryResponse;
import com.quizplatform.backend.modules.category.domain.service.CategoryService;
import com.quizplatform.backend.modules.quiz.domain.dto.QuizResponseDto;
import com.quizplatform.backend.modules.quiz.domain.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final CategoryService categoryService;
    private final QuizService quizService;

    // ROOT GET /api/v1/quizzes -> Barcha aktiv viktorinalar ro'yxati
    @GetMapping
    public ResponseEntity<List<QuizResponseDto.QuizSummaryResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<QuizResponseDto.QuizSummaryResponse>> getQuizzesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(quizService.getQuizzesByCategory(categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponseDto.QuizPublicResponse> getQuizDetails(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }
}