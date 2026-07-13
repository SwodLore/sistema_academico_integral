package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.ActualizarPerfilRequest;
import com.universidad.sistema_academico.dto.CambiarPasswordRequest;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> miPerfil(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(datos(usuario));
    }

    @PutMapping
    public ResponseEntity<?> actualizar(@AuthenticationPrincipal Usuario usuario,
                                        @Valid @RequestBody ActualizarPerfilRequest request,
                                        BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        usuario.setNombres(request.getNombres().trim());
        usuario.setApellidos(request.getApellidos().trim());
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(datos(usuario));
    }

    @PutMapping("/password")
    public ResponseEntity<?> cambiarPassword(@AuthenticationPrincipal Usuario usuario,
                                             @Valid @RequestBody CambiarPasswordRequest request,
                                             BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña actual es incorrecta"));
        }
        usuario.setPassword(passwordEncoder.encode(request.getPasswordNueva()));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
    }

    private Map<String, Object> datos(Usuario usuario) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", usuario.getId());
        data.put("nombres", usuario.getNombres());
        data.put("apellidos", usuario.getApellidos());
        data.put("email", usuario.getEmail());
        data.put("codigoUsuario", usuario.getCodigoUsuario());
        data.put("rol", usuario.getRol());
        return data;
    }

    private Map<String, String> errores(BindingResult result) {
        Map<String, String> errores = new HashMap<>();
        result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return errores;
    }
}
