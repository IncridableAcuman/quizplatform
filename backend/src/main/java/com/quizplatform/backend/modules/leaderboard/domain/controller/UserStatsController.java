package com.quizplatform.backend.modules.leaderboard.domain.controller;

import com.quizplatform.backend.modules.leaderboard.domain.dto.LeaderboardDto;
import com.quizplatform.backend.modules.leaderboard.domain.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class UserStatsController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/me")
    public ResponseEntity<LeaderboardDto.UserStatsResponse> getMyStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(leaderboardService.getUserStats(userDetails.getUsername()));
    }
}
