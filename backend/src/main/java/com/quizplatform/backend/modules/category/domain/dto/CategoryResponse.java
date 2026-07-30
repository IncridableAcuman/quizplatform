package com.quizplatform.backend.modules.category.domain.dto;

import com.quizplatform.backend.modules.category.domain.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private Long parentId;

    public static CategoryResponse fromEntity(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .parentId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .build();
    }
}