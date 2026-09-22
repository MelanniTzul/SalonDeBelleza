package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.AuthResponse;
import com.salondebellezafamiliar.salonapi.dto.LoginRequest;
import com.salondebellezafamiliar.salonapi.dto.RegistroRequest;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse registrar(RegistroRequest request) {
        String email = normalizar(request.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado");
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.nombre().trim())
                .apellido(request.apellido().trim())
                .email(email)
                .telefono(request.telefono() == null || request.telefono().isBlank() ? null : request.telefono().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                // El registro publico solo crea clientes. Estilistas y admins los da de alta
                // el admin en /api/admin/usuarios.
                .rol(Rol.CLIENTE)
                .build();
        usuarioRepository.save(usuario);
        return respuesta(usuario);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizar(request.email());
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        // Se revisa la contrasena aunque el usuario no exista, para no delatar
        // que correos estan registrados por el tiempo de respuesta.
        boolean credencialesValidas = usuario != null
                && usuario.isActivo()
                && passwordEncoder.matches(request.password(), usuario.getPasswordHash());

        if (!credencialesValidas) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        }
        return respuesta(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse perfil(String email) {
        return usuarioRepository.findByEmail(normalizar(email))
                .filter(Usuario::isActivo)
                .map(UsuarioResponse::desde)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesión ya no es válida"));
    }

    private AuthResponse respuesta(Usuario usuario) {
        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());
        return new AuthResponse(token, "Bearer", jwtService.getExpiracionSegundos(), UsuarioResponse.desde(usuario));
    }

    private String normalizar(String email) {
        return email.trim().toLowerCase();
    }
}
