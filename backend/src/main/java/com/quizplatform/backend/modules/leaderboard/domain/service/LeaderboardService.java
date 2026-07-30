package com.quizplatform.backend.modules.leaderboard.domain.service;



import com.quizplatform.backend.modules.auth.domain.entity.User;
import com.quizplatform.backend.modules.auth.domain.repository.UserRepository;
import com.quizplatform.backend.modules.leaderboard.domain.dto.LeaderboardDto;
import com.quizplatform.backend.modules.result.domain.repository.ResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ResultRepository resultRepository;

    // 1. Umumiy (All-Time) Leaderboard
    public List<LeaderboardDto.UserRankResponse> getAllTimeLeaderboard() {
        List<User> topUsers = userRepository.findTop100ByOrderByTotalScoreDesc();
        List<LeaderboardDto.UserRankResponse> response = new ArrayList<>();

        long rank = 1;
        for (User user : topUsers) {
            response.add(LeaderboardDto.UserRankResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .score(user.getTotalScore())
                    .rank(rank++)
                    .build());
        }
        return response;
    }

    // 2. Kunlik Leaderboard (Oxirgi 24 soat)
    public List<LeaderboardDto.UserRankResponse> getDailyLeaderboard() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusDays(1);
        return getLeaderboardByPeriod(twentyFourHoursAgo);
    }

    // 3. Haftalik Leaderboard (Oxirgi 7 kun)
    public List<LeaderboardDto.UserRankResponse> getWeeklyLeaderboard() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusWeeks(1);
        return getLeaderboardByPeriod(sevenDaysAgo);
    }

    private List<LeaderboardDto.UserRankResponse> getLeaderboardByPeriod(LocalDateTime startDate) {
        List<Object[]> rawResults = resultRepository.findTopUsersByPeriod(startDate);
        List<LeaderboardDto.UserRankResponse> response = new ArrayList<>();

        long rank = 1;
        for (Object[] row : rawResults) {
            response.add(LeaderboardDto.UserRankResponse.builder()
                    .userId((Long) row[0])
                    .username((String) row[1])
                    .fullName((String) row[2])
                    .score(((Number) row[3]).intValue())
                    .totalQuizzesTaken(((Number) row[4]).intValue())
                    .rank(rank++)
                    .build());
        }
        return response;
    }

    // 4. Foydalanuvchining shaxsiy chuqurlashtirilgan statistikasi
    public LeaderboardDto.UserStatsResponse getUserStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi"));

        List<Object[]> aggregated = resultRepository.getUserAggregatedStats(user.getId());

        int totalQuizzes = 0;
        int passedQuizzes = 0;
        int avgTimeSeconds = 0;
        double accuracy = 0.0;

        if (!aggregated.isEmpty() && aggregated.get(0)[0] != null) {
            Object[] stats = aggregated.get(0);
            totalQuizzes = ((Number) stats[0]).intValue();
            passedQuizzes = stats[1] != null ? ((Number) stats[1]).intValue() : 0;
            avgTimeSeconds = stats[2] != null ? ((Number) stats[2]).intValue() : 0;

            long totalCorrect = stats[3] != null ? ((Number) stats[3]).longValue() : 0;
            long totalQuestions = stats[4] != null ? ((Number) stats[4]).longValue() : 0;

            if (totalQuestions > 0) {
                accuracy = Math.round(((double) totalCorrect / totalQuestions * 100) * 100.0) / 100.0;
            }
        }

        return LeaderboardDto.UserStatsResponse.builder()
                .username(user.getUsername())
                .fullName(user.getFullName())
                .totalScore(user.getTotalScore())
                .totalQuizzesCompleted(totalQuizzes)
                .passedQuizzes(passedQuizzes)
                .accuracyPercentage(accuracy)
                .averageTimeTakenSeconds(avgTimeSeconds)
                .memberSince(user.getCreatedAt())
                .build();
    }
}