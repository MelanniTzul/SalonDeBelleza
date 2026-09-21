package com.salondebellezafamiliar.salonapi.config;

<<<<<<< HEAD
import com.salondebellezafamiliar.salonapi.security.JwtAuthFilter;
import com.salondebellezafamiliar.salonapi.security.RespuestaErrorSeguridad;
import lombok.RequiredArgsConstructor;
=======
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import com.salondebellezafamiliar.salonapi.service.JwtService;
>>>>>>> feature/Servicios
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
<<<<<<< HEAD
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
=======
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
>>>>>>> feature/Servicios
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
<<<<<<< HEAD
=======
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
>>>>>>> feature/Servicios
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
<<<<<<< HEAD
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
=======
>>>>>>> feature/Servicios
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RespuestaErrorSeguridad respuestaErrorSeguridad;

    @Value("${app.cors.allowed-origins}")
    private String origenesPermitidos;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtService jwtService, UsuarioRepository usuarioRepository) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
<<<<<<< HEAD
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(respuestaErrorSeguridad)
                .accessDeniedHandler(respuestaErrorSeguridad))
            .authorizeHttpRequests(auth -> auth
                // Documentacion y salud
                .requestMatchers("/docs", "/docs/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health", "/error").permitAll()
                // Login y registro abiertos
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                // El navegador manda OPTIONS antes de cada peticion con token
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // El catalogo se ve sin iniciar sesion
                .requestMatchers(HttpMethod.GET, "/api/catalogo/**").permitAll()
                // Zonas por rol
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
=======
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/docs", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/actuator/health", "/error").permitAll()
                // Catálogo público (solo lectura) e imágenes subidas
                .requestMatchers(HttpMethod.GET, "/api/categorias/**", "/api/servicios/**", "/api/productos/**", "/api/cortes/**", "/uploads/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
                .anyRequest().authenticated())
            .addFilterBefore(new JwtAuthenticationFilter(jwtService, usuarioRepository), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Orígenes del frontend permitidos (app.cors.allowed-origins, separados por coma)
    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String origenes) {
        CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOrigins(Arrays.stream(origenes.split(",")).map(String::trim).filter(o -> !o.isEmpty()).toList());
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuracion.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuracion.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/**", configuracion);
        return fuente;
>>>>>>> feature/Servicios
    }
}
