package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.ListaDeseosDto;
import com.salondebellezafamiliar.salonapi.entity.*;
import com.salondebellezafamiliar.salonapi.repository.ListaDeseoRepository;
import com.salondebellezafamiliar.salonapi.repository.ProductoRepository;
import com.salondebellezafamiliar.salonapi.repository.ServicioRepository;
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
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ListaDeseosServiceTest {

    @Mock private ListaDeseoRepository listaDeseoRepository;
    @Mock private ServicioRepository servicioRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private UsuarioRepository usuarioRepository;

    private ListaDeseosService servicio;
    private Servicio corte;
    private Producto cera;

    @BeforeEach
    void prepararDatos() {
        servicio = new ListaDeseosService(listaDeseoRepository, servicioRepository, productoRepository, usuarioRepository);

        Usuario ana = Usuario.builder().id(3L).nombre("Ana").apellido("R").email("ana@correo.com")
                .passwordHash("h").rol(Rol.CLIENTE).activo(true).build();
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(ana));

        Categoria cabello = new Categoria();
        cabello.setSlug("cabello"); cabello.setNombre("Cabello");
        corte = new Servicio();
        corte.setId(10L); corte.setSlug("corte-dama"); corte.setNombre("Corte dama");
        corte.setCategoria(cabello); corte.setPrecio(new BigDecimal("150")); corte.setActivo(true);
        cera = new Producto();
        cera.setId(20L); cera.setSlug("cera-mate"); cera.setNombre("Cera mate"); cera.setMarca("Level 3");
        cera.setCategoria(cabello); cera.setActivo(true);
    }

    @Test
    void listarSeparaServiciosYProductos() {
        when(listaDeseoRepository.listarDeUsuario(3L)).thenReturn(List.of(
                ListaDeseo.builder().usuarioId(3L).producto(cera).build(),
                ListaDeseo.builder().usuarioId(3L).servicio(corte).build()));

        ListaDeseosDto lista = servicio.listar("ana@correo.com");

        assertThat(lista.servicios()).extracting("slug").containsExactly("corte-dama");
        assertThat(lista.productos()).extracting("slug").containsExactly("cera-mate");
    }

    @Test
    void listarOcultaLoQueElAdminDesactivo() {
        corte.setActivo(false);
        when(listaDeseoRepository.listarDeUsuario(3L)).thenReturn(List.of(
                ListaDeseo.builder().usuarioId(3L).servicio(corte).build()));

        assertThat(servicio.listar("ana@correo.com").servicios()).isEmpty();
    }

    @Test
    void agregarServicioGuardaLaFila() {
        when(servicioRepository.buscarActivoPorSlug("corte-dama")).thenReturn(Optional.of(corte));
        when(listaDeseoRepository.existsByUsuarioIdAndServicioId(3L, 10L)).thenReturn(false);

        servicio.agregarServicio("ana@correo.com", "corte-dama");

        ArgumentCaptor<ListaDeseo> fila = ArgumentCaptor.forClass(ListaDeseo.class);
        verify(listaDeseoRepository).save(fila.capture());
        assertThat(fila.getValue().getUsuarioId()).isEqualTo(3L);
        assertThat(fila.getValue().getServicio()).isSameAs(corte);
        assertThat(fila.getValue().getProducto()).isNull();
    }

    @Test
    void agregarDosVecesNoDuplica() {
        when(servicioRepository.buscarActivoPorSlug("corte-dama")).thenReturn(Optional.of(corte));
        when(listaDeseoRepository.existsByUsuarioIdAndServicioId(3L, 10L)).thenReturn(true);

        servicio.agregarServicio("ana@correo.com", "corte-dama");

        verify(listaDeseoRepository, never()).save(any());
    }

    @Test
    void agregarUnSlugInexistenteDa404() {
        when(productoRepository.buscarActivoPorSlug("nada")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.agregarProducto("ana@correo.com", "nada"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void quitarBorraPorUsuarioYProducto() {
        when(productoRepository.findBySlug("cera-mate")).thenReturn(Optional.of(cera));

        servicio.quitarProducto("ana@correo.com", "cera-mate");

        verify(listaDeseoRepository).deleteByUsuarioIdAndProductoId(3L, 20L);
    }

    @Test
    void quitarAlgoQueNoExisteNoRevienta() {
        when(servicioRepository.findBySlug("nada")).thenReturn(Optional.empty());

        servicio.quitarServicio("ana@correo.com", "nada");

        verify(listaDeseoRepository, never()).deleteByUsuarioIdAndServicioId(any(), any());
    }

    @Test
    void unUsuarioDesactivadoNoTieneLista() {
        when(usuarioRepository.findByEmail("nadie@correo.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.listar("nadie@correo.com"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
