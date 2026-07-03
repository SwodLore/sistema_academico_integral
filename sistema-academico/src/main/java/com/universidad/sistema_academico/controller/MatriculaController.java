package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.SolicitudMatriculaRequest;
import com.universidad.sistema_academico.entity.Matricula;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.service.MatriculaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    @Autowired
    private MatriculaService matriculaService;

    @GetMapping("/cursos-disponibles")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> cursosDisponibles(@AuthenticationPrincipal Usuario usuario) {
        try {
            return ResponseEntity.ok(matriculaService.cursosDisponibles(usuario));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/mi-matricula")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> miMatricula(@AuthenticationPrincipal Usuario usuario) {
        try {
            Optional<Matricula> matricula = matriculaService.miMatricula(usuario);
            if (matricula.isEmpty()) {
                return ResponseEntity.ok(new HashMap<>());
            }
            Map<String, Object> body = new HashMap<>();
            body.put("matricula", matricula.get());
            body.put("cursos", matriculaService.cursosDeMatricula(matricula.get()));
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/solicitar")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> solicitar(@AuthenticationPrincipal Usuario usuario,
                                       @Valid @RequestBody SolicitudMatriculaRequest request,
                                       BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errores);
        }

        try {
            return ResponseEntity.ok(matriculaService.solicitar(usuario, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
