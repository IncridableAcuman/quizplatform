package com.quizplatform.backend.modules.leaderboard.domain.controller;



import com.quizplatform.backend.modules.leaderboard.domain.dto.LeaderboardDto;
import com.quizplatform.backend.modules.leaderboard.domain.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/all-time")
    public ResponseEntity<List<LeaderboardDto.UserRankResponse>> getAllTimeLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getAllTimeLeaderboard());
    }

    @GetMapping("/daily")
    public ResponseEntity<List<LeaderboardDto.UserRankResponse>> getDailyLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getDailyLeaderboard());
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<LeaderboardDto.UserRankResponse>> getWeeklyLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getWeeklyLeaderboard());
    }
}

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
class UserStatsController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/me")
    public ResponseEntity<LeaderboardDto.UserStatsResponse> getMyStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(leaderboardService.getUserStats(userDetails.getUsername()));
    }
}
