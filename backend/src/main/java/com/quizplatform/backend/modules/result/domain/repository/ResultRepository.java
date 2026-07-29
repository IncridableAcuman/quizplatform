package com.quizplatform.backend.modules.result.domain.repository;

import com.quizplatform.backend.modules.result.domain.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result,Long> {
    List<Result> findByUserId(Long userId);
}
