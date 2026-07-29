package com.quizplatform.backend.modules.auth.domain.dto;


import com.quizplatform.backend.modules.auth.domain.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank private String username;
        @NotBlank @Email private String email;
        @NotBlank private String password;
        private String fullName;
    }

    @Data
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private String username;
        private Role role;

        public AuthResponse(String accessToken, String username, Role role) {
            this.accessToken = accessToken;
            this.username = username;
            this.role = role;
        }
    }
}
