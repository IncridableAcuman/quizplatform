package com.quizplatform.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend ishlayotgan domenlarga ruxsat beramiz
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173", // Vite default port
                "http://localhost:3000"  // React default port
        ));

        // Barcha kerakli HTTP metodlarga ruxsat
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Barcha header'larga ruxsat (Authorization, Content-Type va h.k.)
        configuration.setAllowedHeaders(List.of("*"));

        // Cookie yoki Authorization header'larini qo'llab-quvvatlash uchun
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}