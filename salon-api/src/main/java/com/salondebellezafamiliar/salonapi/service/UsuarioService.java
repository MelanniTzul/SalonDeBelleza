package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.ActualizarUsuarioRequest;
import com.salondebellezafamiliar.salonapi.dto.CambiarPasswordRequest;
import com.salondebellezafamiliar.salonapi.dto.CrearUsuarioRequest;
import com.salondebellezafamiliar.salonapi.dto.PaginaResponse;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.entity.Estilista;
import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.EstilistaRepository;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EstilistaRepository estilistaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PaginaResponse<UsuarioResponse> listar(Rol rol, Boolean activo, String busqueda, Pageable pageable) {
        String texto = busqueda == null || busqueda.isBlank() ? null : busqueda.trim();
        Page<Usuario> pagina = usuarioRepository.buscar(rol, activo, texto, pageable);
        return PaginaResponse.desde(pagina, this::conEspecialidad);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return conEspecialidad(buscarOFallar(id));
    }

    @Transactional
    public UsuarioResponse crear(CrearUsuarioRequest request) {
        // Nadie crea administradores desde la app; el admin sale de la migracion inicial.
        if (request.rol() == Rol.ADMINISTRADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No se pueden crear administradores desde el sistema");
        }

        String email = normalizar(request.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }

        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .nombre(request.nombre().trim())
                .apellido(request.apellido().trim())
                .email(email)
                .telefono(limpiar(request.telefono()))
                .passwordHash(passwordEncoder.encode(request.password()))
                .rol(request.rol())
                .build());

        if (request.rol() == Rol.ESTILISTA) {
            crearFichaEstilista(usuario.getId(), request.especialidad());
        }
        return conEspecialidad(usuario);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
        Usuario usuario = buscarOFallar(id);
        String email = normalizar(request.email());

        if (!email.equals(usuario.getEmail()) && usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya esta registrado");
        }

        usuario.setNombre(request.nombre().trim());
        usuario.setApellido(request.apellido().trim());
        usuario.setEmail(email);
        usuario.setTelefono(limpiar(request.telefono()));

        if (usuario.getRol() == Rol.ESTILISTA) {
            estilistaRepository.findByUsuarioId(id)
                    .ifPresent(ficha -> ficha.setEspecialidad(limpiar(request.especialidad())));
        }
        return conEspecialidad(usuario);
    }

    // "Eliminar" es desactivar: el historial de citas necesita que el usuario siga existiendo.
    @Transactional
    public UsuarioResponse cambiarEstado(Long id, boolean activo, String emailDelQuePide) {
        Usuario usuario = buscarOFallar(id);

        if (!activo && usuario.getEmail().equals(normalizar(emailDelQuePide))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes desactivar tu propia cuenta");
        }

        usuario.setActivo(activo);
        if (usuario.getRol() == Rol.ESTILISTA) {
            estilistaRepository.findByUsuarioId(id).ifPresent(ficha -> ficha.setActivo(activo));
        }
        return conEspecialidad(usuario);
    }

    @Transactional
    public void cambiarPassword(Long id, CambiarPasswordRequest request) {
        buscarOFallar(id).setPasswordHash(passwordEncoder.encode(request.password()));
    }

    private void crearFichaEstilista(Long usuarioId, String especialidad) {
        estilistaRepository.save(Estilista.builder()
                .usuarioId(usuarioId)
                .especialidad(limpiar(especialidad))
                .build());
    }

    private UsuarioResponse conEspecialidad(Usuario usuario) {
        if (usuario.getRol() != Rol.ESTILISTA) {
            return UsuarioResponse.desde(usuario);
        }
        String especialidad = estilistaRepository.findByUsuarioId(usuario.getId())
                .map(Estilista::getEspecialidad)
                .orElse(null);
        return UsuarioResponse.desde(usuario, especialidad);
    }

    private Usuario buscarOFallar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private String normalizar(String email) {
        return email.trim().toLowerCase();
    }

    private String limpiar(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
