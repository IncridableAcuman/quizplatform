package com.quizplatform.backend.modules.leaderboard.domain.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class LeaderboardDto {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserRankResponse {
        private Long userId;
        private String username;
        private String fullName;
        private Integer score;
        private Integer totalQuizzesTaken;
        private Long rank;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserStatsResponse {
        private String username;
        private String fullName;
        private Integer totalScore;
        private Integer totalQuizzesCompleted;
        private Integer passedQuizzes;
        private Double accuracyPercentage;
        private Integer averageTimeTakenSeconds;
        private LocalDateTime memberSince;
    }
}
