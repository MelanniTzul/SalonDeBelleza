package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.AuthResponse;
import com.salondebellezafamiliar.salonapi.dto.LoginRequest;
import com.salondebellezafamiliar.salonapi.dto.RegistroRequest;
import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String PASSWORD = "Cliente1234!";

    @Mock
    private UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService = new JwtService("clave-de-pruebas-suficientemente-larga-1234567890", 60);

    private AuthService authService;
    private Usuario usuario;

    @BeforeEach
    void prepararDatos() {
        authService = new AuthService(usuarioRepository, passwordEncoder, jwtService);
        usuario = Usuario.builder()
                .id(1L)
                .nombre("Ana")
                .apellido("Rodríguez")
                .email("ana@correo.com")
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .rol(Rol.CLIENTE)
                .activo(true)
                .build();
    }

    @Test
    void iniciaSesionConCredencialesCorrectas() {
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuario));

        AuthResponse respuesta = authService.login(new LoginRequest("ana@correo.com", PASSWORD));

        assertThat(respuesta.token()).isNotBlank();
        assertThat(respuesta.tipo()).isEqualTo("Bearer");
        assertThat(respuesta.usuario().email()).isEqualTo("ana@correo.com");
        assertThat(respuesta.usuario().rol()).isEqualTo("CLIENTE");
        assertThat(jwtService.leerClaims(respuesta.token()).get("rol", String.class)).isEqualTo("CLIENTE");
    }

    @Test
    void normalizaElCorreoAntesDeBuscarlo() {
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuario));

        AuthResponse respuesta = authService.login(new LoginRequest("  ANA@Correo.com  ", PASSWORD));

        assertThat(respuesta.usuario().email()).isEqualTo("ana@correo.com");
    }

    @Test
    void rechazaUnaContrasenaIncorrecta() {
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> authService.login(new LoginRequest("ana@correo.com", "otra-cosa")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void rechazaUnCorreoQueNoExisteConElMismoMensaje() {
        when(usuarioRepository.findByEmail("nadie@correo.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("nadie@correo.com", PASSWORD)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Correo o contraseña incorrectos");
    }

    @Test
    void rechazaUnUsuarioDesactivado() {
        usuario.setActivo(false);
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> authService.login(new LoginRequest("ana@correo.com", PASSWORD)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void registraSiempreConRolClienteYContrasenaHasheada() {
        when(usuarioRepository.existsByEmail("nueva@correo.com")).thenReturn(false);

        AuthResponse respuesta = authService.registrar(
                new RegistroRequest("Nueva", "Usuaria", " Nueva@Correo.com ", "5555-3030", PASSWORD));

        ArgumentCaptor<Usuario> capturado = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(capturado.capture());

        Usuario guardado = capturado.getValue();
        assertThat(guardado.getEmail()).isEqualTo("nueva@correo.com");
        assertThat(guardado.getRol()).isEqualTo(Rol.CLIENTE);
        assertThat(guardado.getPasswordHash()).isNotEqualTo(PASSWORD);
        assertThat(passwordEncoder.matches(PASSWORD, guardado.getPasswordHash())).isTrue();
        assertThat(respuesta.usuario().rol()).isEqualTo("CLIENTE");
    }

    @Test
    void noPermiteRegistrarUnCorreoRepetido() {
        when(usuarioRepository.existsByEmail("ana@correo.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registrar(
                new RegistroRequest("Ana", "R", "ana@correo.com", null, PASSWORD)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(usuarioRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void devuelveElPerfilDelUsuarioAutenticado() {
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuario));

        assertThat(authService.perfil("Ana@Correo.com").nombre()).isEqualTo("Ana");
    }

    @Test
    void rechazaElPerfilDeUnUsuarioDesactivado() {
        usuario.setActivo(false);
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> authService.perfil("ana@correo.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("La sesión ya no es válida");
    }
}
