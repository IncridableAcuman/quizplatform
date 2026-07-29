package com.quizplatform.backend.modules.result.domain.entity;
import com.quizplatform.backend.modules.auth.domain.entity.User;
import com.quizplatform.backend.modules.quiz.domain.entity.Quiz;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private Integer score; // Toplangan jami ball

    private Integer totalQuestions; // Jami savollar soni

    private Integer correctAnswers; // To'g'ri javoblar soni

    private Integer timeTakenSeconds; // Testga sarflangan vaqt (soniyada)

    private Boolean isPassed; // Testdan o'tdimi yoki yo'qmi

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime completedAt;
}
