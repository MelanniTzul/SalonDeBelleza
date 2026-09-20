package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.ActualizarUsuarioRequest;
import com.salondebellezafamiliar.salonapi.dto.CambiarPasswordRequest;
import com.salondebellezafamiliar.salonapi.dto.CrearUsuarioRequest;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.entity.Estilista;
import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.EstilistaRepository;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EstilistaRepository estilistaRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private UsuarioService usuarioService;
    private Usuario admin;
    private Usuario estilista;

    @BeforeEach
    void prepararDatos() {
        usuarioService = new UsuarioService(usuarioRepository, estilistaRepository, passwordEncoder);

        admin = Usuario.builder()
                .id(1L).nombre("Admin").apellido("Salon")
                .email("admin@salon.com").passwordHash("hash")
                .rol(Rol.ADMINISTRADOR).activo(true)
                .build();

        estilista = Usuario.builder()
                .id(2L).nombre("Marisol").apellido("Gomez")
                .email("marisol@salon.com").passwordHash("hash")
                .rol(Rol.ESTILISTA).activo(true)
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(estilista));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        when(estilistaRepository.save(any(Estilista.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void crearEstilistaTambienCreaSuFicha() {
        when(usuarioRepository.existsByEmail("andrea@salon.com")).thenReturn(false);

        usuarioService.crear(new CrearUsuarioRequest(
                "Andrea", "Lopez", " Andrea@Salon.com ", "5555", "Password123", Rol.ESTILISTA, "Corte"));

        ArgumentCaptor<Usuario> usuario = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(usuario.capture());
        assertThat(usuario.getValue().getEmail()).isEqualTo("andrea@salon.com");
        assertThat(usuario.getValue().getRol()).isEqualTo(Rol.ESTILISTA);
        assertThat(passwordEncoder.matches("Password123", usuario.getValue().getPasswordHash())).isTrue();

        ArgumentCaptor<Estilista> ficha = ArgumentCaptor.forClass(Estilista.class);
        verify(estilistaRepository).save(ficha.capture());
        assertThat(ficha.getValue().getEspecialidad()).isEqualTo("Corte");
    }

    @Test
    void crearClienteNoCreaFichaDeEstilista() {
        when(usuarioRepository.existsByEmail("ana@correo.com")).thenReturn(false);

        usuarioService.crear(new CrearUsuarioRequest(
                "Ana", "R", "ana@correo.com", null, "Password123", Rol.CLIENTE, null));

        verify(estilistaRepository, never()).save(any());
    }

    @Test
    void noDejaCrearOtroAdministrador() {
        assertThatThrownBy(() -> usuarioService.crear(new CrearUsuarioRequest(
                "Nuevo", "Admin", "otroadmin@salon.com", null, "Password123", Rol.ADMINISTRADOR, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void siDejaCrearClientes() {
        when(usuarioRepository.existsByEmail("walkin@correo.com")).thenReturn(false);

        assertThat(usuarioService.crear(new CrearUsuarioRequest(
                "Sofia", "Perez", "walkin@correo.com", null, "Password123", Rol.CLIENTE, null)).rol())
                .isEqualTo("CLIENTE");
    }

    @Test
    void noPermiteCrearConCorreoRepetido() {
        when(usuarioRepository.existsByEmail("marisol@salon.com")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.crear(new CrearUsuarioRequest(
                "Otra", "Persona", "marisol@salon.com", null, "Password123", Rol.ESTILISTA, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void desactivarDejaAlUsuarioEnLaBaseConActivoFalse() {
        UsuarioResponse respuesta = usuarioService.cambiarEstado(2L, false, "admin@salon.com");

        assertThat(respuesta.activo()).isFalse();
        assertThat(estilista.isActivo()).isFalse();
        verify(usuarioRepository, never()).delete(any());
        verify(usuarioRepository, never()).deleteById(any());
    }

    @Test
    void desactivarEstilistaTambienDesactivaSuFicha() {
        Estilista ficha = Estilista.builder().id(9L).usuarioId(2L).activo(true).build();
        when(estilistaRepository.findByUsuarioId(2L)).thenReturn(Optional.of(ficha));

        usuarioService.cambiarEstado(2L, false, "admin@salon.com");

        assertThat(ficha.isActivo()).isFalse();
    }

    @Test
    void elAdminNoPuedeDesactivarseASiMismo() {
        assertThatThrownBy(() -> usuarioService.cambiarEstado(1L, false, "Admin@Salon.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("No puedes desactivar tu propia cuenta");

        assertThat(admin.isActivo()).isTrue();
    }

    @Test
    void reactivarSiFuncionaSobreLaPropiaCuenta() {
        admin.setActivo(false);

        assertThat(usuarioService.cambiarEstado(1L, true, "admin@salon.com").activo()).isTrue();
    }

    @Test
    void actualizarNoCambiaElRol() {
        usuarioService.actualizar(2L, new ActualizarUsuarioRequest(
                "Marisol", "Gomez Perez", "marisol@salon.com", "5555-9999", "Color"));

        assertThat(estilista.getRol()).isEqualTo(Rol.ESTILISTA);
        assertThat(estilista.getApellido()).isEqualTo("Gomez Perez");
        assertThat(estilista.getTelefono()).isEqualTo("5555-9999");
    }

    @Test
    void actualizarRechazaUnCorreoDeOtroUsuario() {
        when(usuarioRepository.existsByEmail("admin@salon.com")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.actualizar(2L, new ActualizarUsuarioRequest(
                "Marisol", "Gomez", "admin@salon.com", null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void actualizarDejaConservarElPropioCorreo() {
        when(usuarioRepository.existsByEmail("marisol@salon.com")).thenReturn(true);

        usuarioService.actualizar(2L, new ActualizarUsuarioRequest(
                "Marisol", "Gomez", "marisol@salon.com", null, null));

        assertThat(estilista.getEmail()).isEqualTo("marisol@salon.com");
    }

    @Test
    void cambiarPasswordGuardaElHashNoElTextoPlano() {
        usuarioService.cambiarPassword(2L, new CambiarPasswordRequest("ClaveNueva123"));

        assertThat(estilista.getPasswordHash()).isNotEqualTo("ClaveNueva123");
        assertThat(passwordEncoder.matches("ClaveNueva123", estilista.getPasswordHash())).isTrue();
    }

    @Test
    void fallaCon404SiElUsuarioNoExiste() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.obtener(99L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }
}
