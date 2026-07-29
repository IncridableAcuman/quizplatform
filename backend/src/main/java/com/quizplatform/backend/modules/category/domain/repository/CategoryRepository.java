package com.quizplatform.backend.modules.category.domain.repository;

import com.quizplatform.backend.modules.category.domain.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category,Long> {
    List<Category> findByParentCategoryIsNull();
}
