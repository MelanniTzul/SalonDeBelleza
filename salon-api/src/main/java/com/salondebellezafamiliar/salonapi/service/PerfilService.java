package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.ActualizarPerfilRequest;
import com.salondebellezafamiliar.salonapi.dto.CambiarMiPasswordRequest;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.entity.Estilista;
import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.EstilistaRepository;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

// Lo que un usuario puede hacer sobre su propia cuenta. Siempre se parte del email
// que viene en el token, nunca de un id que mande el cliente.
@Service
@RequiredArgsConstructor
public class PerfilService {

    private static final String CARPETA_FOTOS = "perfiles";

    private final UsuarioRepository usuarioRepository;
    private final EstilistaRepository estilistaRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImagenService imagenService;

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(String email) {
        return respuesta(buscar(email));
    }

    @Transactional
    public UsuarioResponse actualizar(String email, ActualizarPerfilRequest request) {
        Usuario usuario = buscar(email);
        usuario.setNombre(request.nombre().trim());
        usuario.setApellido(request.apellido().trim());
        usuario.setTelefono(limpiar(request.telefono()));

        if (usuario.getRol() == Rol.ESTILISTA) {
            estilistaRepository.findByUsuarioId(usuario.getId())
                    .ifPresent(ficha -> ficha.setEspecialidad(limpiar(request.especialidad())));
        }
        return respuesta(usuario);
    }

    @Transactional
    public void cambiarPassword(String email, CambiarMiPasswordRequest request) {
        Usuario usuario = buscar(email);
        // Va como 400 y no 401 a proposito: el front cierra sesion con cualquier 401.
        if (!passwordEncoder.matches(request.passwordActual(), usuario.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contrasena actual no es correcta");
        }
        if (request.passwordActual().equals(request.passwordNueva())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contrasena nueva debe ser distinta a la actual");
        }
        usuario.setPasswordHash(passwordEncoder.encode(request.passwordNueva()));
    }

    @Transactional
    public UsuarioResponse subirFoto(String email, MultipartFile archivo) {
        Usuario usuario = buscar(email);
        String anterior = usuario.getFotoUrl();
        usuario.setFotoUrl(imagenService.guardar(archivo, CARPETA_FOTOS));
        // La vieja se borra despues de guardar la nueva, por si la subida falla a medias.
        imagenService.eliminar(anterior);
        return respuesta(usuario);
    }

    @Transactional
    public UsuarioResponse eliminarFoto(String email) {
        Usuario usuario = buscar(email);
        imagenService.eliminar(usuario.getFotoUrl());
        usuario.setFotoUrl(null);
        return respuesta(usuario);
    }

    private Usuario buscar(String email) {
        return usuarioRepository.findByEmail(email.trim().toLowerCase())
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesion ya no es valida"));
    }

    private UsuarioResponse respuesta(Usuario usuario) {
        if (usuario.getRol() != Rol.ESTILISTA) {
            return UsuarioResponse.desde(usuario);
        }
        String especialidad = estilistaRepository.findByUsuarioId(usuario.getId())
                .map(Estilista::getEspecialidad)
                .orElse(null);
        return UsuarioResponse.desde(usuario, especialidad);
    }

    private String limpiar(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
