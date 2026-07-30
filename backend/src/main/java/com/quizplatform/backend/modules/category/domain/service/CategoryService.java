package com.quizplatform.backend.modules.category.domain.service;

import com.quizplatform.backend.modules.category.domain.dto.CategoryResponse;
import com.quizplatform.backend.modules.category.domain.entity.Category;
import com.quizplatform.backend.modules.category.domain.repository.CategoryRepository;
import com.quizplatform.backend.modules.quiz.domain.dto.QuizDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public Category createCategory(QuizDto.CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .iconUrl(request.getIconUrl())
                .build();

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Ota kategoriya topilmadi"));
            category.setParentCategory(parent);
        }

        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    public List<Category> getRootCategories() {
        return categoryRepository.findByParentCategoryIsNull();
    }
}