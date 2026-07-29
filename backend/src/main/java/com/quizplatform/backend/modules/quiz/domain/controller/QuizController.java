package com.quizplatform.backend.modules.quiz.domain.controller;



import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.category.domain.service.CategoryService;
import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
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

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(quizService.getQuizzesByCategory(categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizDetails(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }
}
