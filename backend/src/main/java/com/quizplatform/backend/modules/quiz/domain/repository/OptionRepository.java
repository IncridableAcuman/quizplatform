package com.quizplatform.backend.modules.quiz.domain.repository;

import com.quizplatform.backend.modules.quiz.domain.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option,Long> {
    List<Option> findByQuestionId(Long questionId);
}
