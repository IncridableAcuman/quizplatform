package com.quizplatform.backend.modules.leaderboard.domain.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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
        private Integer averageScore;
        private Integer totalQuizzesCompleted;
        private Integer totalQuizzesTaken;
        private Integer passedQuizzes;
        private Double accuracyPercentage;
        private Integer averageTimeTakenSeconds;
        private Integer totalTimeSpentMinutes;
        private LocalDateTime memberSince;

        private List<ScoreHistoryItem> scoreHistory;
        private List<CategoryPerformanceItem> categoryPerformance;
        private List<RecentResultItem> recentResults;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ScoreHistoryItem {
        private String date;
        private Integer score;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CategoryPerformanceItem {
        private String category;
        private Integer score;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RecentResultItem {
        private Long id;
        private String quizTitle;
        private Integer score;
        private Boolean isPassed;
        private String date;
    }
}
