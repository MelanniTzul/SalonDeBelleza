package com.salondebellezafamiliar.salonapi.config;

import com.salondebellezafamiliar.salonapi.security.JwtAuthFilter;
import com.salondebellezafamiliar.salonapi.security.RespuestaErrorSeguridad;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RespuestaErrorSeguridad respuestaErrorSeguridad;

    @Value("${app.cors.allowed-origins}")
    private String origenesPermitidos;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(respuestaErrorSeguridad)
                .accessDeniedHandler(respuestaErrorSeguridad))
            .authorizeHttpRequests(auth -> auth
                // Documentación y salud del servicio
                .requestMatchers("/docs", "/docs/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health", "/error").permitAll()
                // Autenticación pública
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                // El navegador envía OPTIONS antes de cada petición con token (preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Catálogo público: servicios y productos se consultan sin iniciar sesión
                .requestMatchers(HttpMethod.GET, "/api/catalogo/**").permitAll()
                // Zonas privadas por rol
                .requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/estilista/**").hasAnyRole("ESTILISTA", "ADMINISTRADOR")
                .requestMatchers("/api/cliente/**").hasAnyRole("CLIENTE", "ADMINISTRADOR")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(origenesPermitidos.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
