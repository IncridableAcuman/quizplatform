package com.quizplatform.backend.modules.auth.domain.repository;

import com.quizplatform.backend.modules.auth.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    // Barcha davr bo'yicha eng yuqori to'plam ballga ega top foydalanuvchilar
    List<User> findTop100ByOrderByTotalScoreDesc();
}
