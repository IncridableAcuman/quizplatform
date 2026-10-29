package com.quizplatform.backend.modules.category.domain.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.quizplatform.backend.modules.category.domain.dto.CategoryResponse;
import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.category.domain.service.CategoryService;
import com.quizplatform.backend.modules.quiz.domain.dto.QuizDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody QuizDto.CategoryRequest request) {
        Category savedCategory = categoryService.createCategory(request);
        
        // Category entity'ni CategoryResponse DTO'ga o'tkazib qaytaramiz
        CategoryResponse response = CategoryResponse.fromEntity(savedCategory);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/v1/categories
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // GET /api/v1/categories/root (faqat ota kategoriyalar uchun, agar kerak bo'lsa)
    @GetMapping("/root")
    public ResponseEntity<List<Category>> getRootCategories() {
        return ResponseEntity.ok(categoryService.getRootCategories());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody QuizDto.CategoryRequest request) {
        Category updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(CategoryResponse.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}