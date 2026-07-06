package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.RegistrarNotasRequest;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.service.DocenteService;
import com.universidad.sistema_academico.service.NotaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/docentes")
@PreAuthorize("hasRole('DOCENTE')")
public class DocenteController {

    @Autowired
    private DocenteService docenteService;

    @Autowired
    private NotaService notaService;

    @GetMapping("/cursos-asignados")
    public ResponseEntity<?> getCursosAsignados(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String semestre) {
        try {
            return ResponseEntity.ok(docenteService.getCargaAcademica(usuario, anio, semestre));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/asignaciones/{asignacionId}/acta")
    public ResponseEntity<?> getActaNotas(@AuthenticationPrincipal Usuario usuario,
                                          @PathVariable Long asignacionId) {
        try {
            return ResponseEntity.ok(notaService.getActa(usuario, asignacionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/asignaciones/{asignacionId}/notas")
    public ResponseEntity<?> registrarNotas(@AuthenticationPrincipal Usuario usuario,
                                            @PathVariable Long asignacionId,
                                            @Valid @RequestBody RegistrarNotasRequest request,
                                            BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errores);
        }
        try {
            return ResponseEntity.ok(notaService.registrarNotas(usuario, asignacionId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
