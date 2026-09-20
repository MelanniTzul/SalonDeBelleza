package com.salondebellezafamiliar.salonapi.auth.service;

import com.salondebellezafamiliar.salonapi.auth.dto.AuthResponse;
import com.salondebellezafamiliar.salonapi.auth.dto.LoginRequest;
import com.salondebellezafamiliar.salonapi.auth.dto.RegistroRequest;
import com.salondebellezafamiliar.salonapi.auth.entity.Rol;
import com.salondebellezafamiliar.salonapi.auth.entity.Usuario;
import com.salondebellezafamiliar.salonapi.auth.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse registrar(RegistroRequest request) {
        String email = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado");
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.nombre().trim())
                .apellido(request.apellido().trim())
                .email(email)
                .telefono(request.telefono())
                .passwordHash(passwordEncoder.encode(request.password()))
                .rol(Rol.CLIENTE)
                .build();
        usuarioRepository.save(usuario);
        return respuesta(usuario);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .filter(Usuario::isActivo)
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        return respuesta(usuario);
    }

    private AuthResponse respuesta(Usuario usuario) {
        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());
        return new AuthResponse(token, "Bearer", usuario.getEmail(), usuario.getNombre(), usuario.getRol().name());
    }
}
