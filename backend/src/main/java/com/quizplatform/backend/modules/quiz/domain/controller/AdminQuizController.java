package com.quizplatform.backend.modules.quiz.domain.controller;


import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.category.domain.service.CategoryService;
import com.quizplatform.backend.modules.quiz.domain.dto.QuizDto;
import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import com.quizplatform.backend.modules.quiz.domain.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminQuizController {

    private final CategoryService categoryService;
    private final QuizService quizService;

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody QuizDto.CategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PostMapping("/quizzes")
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody QuizDto.QuizRequest request) {
        return ResponseEntity.ok(quizService.createQuiz(request));
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }
}
