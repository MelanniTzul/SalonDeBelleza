package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.ActualizarPerfilRequest;
import com.salondebellezafamiliar.salonapi.dto.CambiarMiPasswordRequest;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.entity.Estilista;
import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.EstilistaRepository;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PerfilServiceTest {

    private static final String PASSWORD = "Cliente1234!";

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EstilistaRepository estilistaRepository;
    @Mock private ImagenService imagenService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private PerfilService perfilService;
    private Usuario cliente;
    private Usuario estilista;

    @BeforeEach
    void prepararDatos() {
        perfilService = new PerfilService(usuarioRepository, estilistaRepository, passwordEncoder, imagenService);

        cliente = Usuario.builder()
                .id(3L).nombre("Ana").apellido("Rodriguez").email("ana@correo.com")
                .passwordHash(passwordEncoder.encode(PASSWORD)).rol(Rol.CLIENTE).activo(true)
                .build();
        estilista = Usuario.builder()
                .id(2L).nombre("Marisol").apellido("Gomez").email("marisol@salon.com")
                .passwordHash("hash").rol(Rol.ESTILISTA).activo(true)
                .build();

        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(cliente));
        when(usuarioRepository.findByEmail("marisol@salon.com")).thenReturn(Optional.of(estilista));
    }

    @Test
    void actualizaSoloLosCamposPermitidos() {
        UsuarioResponse r = perfilService.actualizar("ana@correo.com",
                new ActualizarPerfilRequest(" Ana Maria ", "Rodriguez Lopez", "5555-1111", null));

        assertThat(r.nombre()).isEqualTo("Ana Maria");
        assertThat(r.telefono()).isEqualTo("5555-1111");
        // ni el correo ni el rol se tocan
        assertThat(cliente.getEmail()).isEqualTo("ana@correo.com");
        assertThat(cliente.getRol()).isEqualTo(Rol.CLIENTE);
    }

    @Test
    void laEstilistaPuedeCambiarSuEspecialidad() {
        Estilista ficha = Estilista.builder().id(9L).usuarioId(2L).especialidad("Corte").build();
        when(estilistaRepository.findByUsuarioId(2L)).thenReturn(Optional.of(ficha));

        UsuarioResponse r = perfilService.actualizar("marisol@salon.com",
                new ActualizarPerfilRequest("Marisol", "Gomez", null, "Color y peinado"));

        assertThat(ficha.getEspecialidad()).isEqualTo("Color y peinado");
        assertThat(r.especialidad()).isEqualTo("Color y peinado");
    }

    @Test
    void unClienteNoTieneEspecialidadAunqueLaMande() {
        perfilService.actualizar("ana@correo.com", new ActualizarPerfilRequest("Ana", "R", null, "Lo que sea"));

        verify(estilistaRepository, never()).findByUsuarioId(any());
    }

    @Test
    void cambiaLaPasswordSiLaActualCoincide() {
        perfilService.cambiarPassword("ana@correo.com", new CambiarMiPasswordRequest(PASSWORD, "NuevaClave123"));

        assertThat(passwordEncoder.matches("NuevaClave123", cliente.getPasswordHash())).isTrue();
    }

    @Test
    void rechazaConBadRequestSiLaActualNoCoincideParaNoCerrarSesion() {
        assertThatThrownBy(() -> perfilService.cambiarPassword("ana@correo.com",
                new CambiarMiPasswordRequest("mala", "NuevaClave123")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        assertThat(passwordEncoder.matches(PASSWORD, cliente.getPasswordHash())).isTrue();
    }

    @Test
    void rechazaSiLaNuevaEsIgualALaActual() {
        assertThatThrownBy(() -> perfilService.cambiarPassword("ana@correo.com",
                new CambiarMiPasswordRequest(PASSWORD, PASSWORD)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("distinta");
    }

    @Test
    void subirFotoGuardaLaNuevaYBorraLaVieja() {
        cliente.setFotoUrl("uploads/perfiles/vieja.jpg");
        MultipartFile archivo = new MockMultipartFile("archivo", "foto.jpg", "image/jpeg", new byte[]{1});
        when(imagenService.guardar(archivo, "perfiles")).thenReturn("uploads/perfiles/nueva.jpg");

        UsuarioResponse r = perfilService.subirFoto("ana@correo.com", archivo);

        assertThat(r.fotoUrl()).isEqualTo("uploads/perfiles/nueva.jpg");
        verify(imagenService).eliminar("uploads/perfiles/vieja.jpg");
    }

    @Test
    void eliminarFotoDejaElCampoEnNull() {
        cliente.setFotoUrl("uploads/perfiles/x.jpg");

        UsuarioResponse r = perfilService.eliminarFoto("ana@correo.com");

        assertThat(r.fotoUrl()).isNull();
        verify(imagenService).eliminar("uploads/perfiles/x.jpg");
    }

    @Test
    void unUsuarioDesactivadoYaNoPuedeTocarSuPerfil() {
        cliente.setActivo(false);

        assertThatThrownBy(() -> perfilService.obtener("ana@correo.com"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(imagenService, never()).guardar(any(), eq("perfiles"));
    }
}
