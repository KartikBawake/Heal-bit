package com.healbit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints
                .requestMatchers("/auth/**").permitAll()
                // Public browsing for patients
                .requestMatchers(HttpMethod.GET, "/hospitals", "/hospitals/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/doctors", "/doctors/**").permitAll()
                // Patient-only
                .requestMatchers("/patients/**").hasRole("PATIENT")
                .requestMatchers(HttpMethod.POST, "/appointments").hasRole("PATIENT")
                .requestMatchers(HttpMethod.DELETE, "/appointments/**").hasRole("PATIENT")
                // Hospital-only
                .requestMatchers(HttpMethod.POST, "/doctors").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/doctors").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.DELETE, "/doctors/**").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/hospitals").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.DELETE, "/hospitals").hasRole("HOSPITAL")
                .requestMatchers(HttpMethod.PUT, "/appointments/status").hasRole("HOSPITAL")
                // Appointments listing for both patient and hospital
                .requestMatchers(HttpMethod.GET, "/appointments").hasAnyRole("PATIENT", "HOSPITAL")
                // Admin-only
                .requestMatchers("/admin/**").hasRole("ADMIN")
                // Everything else needs authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
