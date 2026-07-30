package com.quizplatform.backend.modules.user.domain;


import com.quizplatform.backend.modules.leaderboard.domain.dto.LeaderboardDto;
import com.quizplatform.backend.modules.leaderboard.domain.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<LeaderboardDto.UserStatsResponse> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(leaderboardService.getUserStats(userDetails.getUsername()));
    }
}