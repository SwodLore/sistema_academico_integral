package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.ObservarActaRequest;
import com.universidad.sistema_academico.entity.Usuario;
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
@RequestMapping("/api/actas")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECCION')")
public class AdminActaController {

    @Autowired
    private NotaService notaService;

    @GetMapping
    public ResponseEntity<?> listar(@RequestParam(required = false) Integer anio,
                                    @RequestParam(required = false) String semestre) {
        try {
            return ResponseEntity.ok(notaService.listarActas(anio, semestre));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{actaId}")
    public ResponseEntity<?> detalle(@PathVariable Long actaId) {
        try {
            return ResponseEntity.ok(notaService.getActaDetalle(actaId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{actaId}/validar")
    public ResponseEntity<?> validar(@AuthenticationPrincipal Usuario admin, @PathVariable Long actaId) {
        try {
            return ResponseEntity.ok(notaService.validarActa(admin, actaId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{actaId}/observar")
    public ResponseEntity<?> observar(@AuthenticationPrincipal Usuario admin,
                                      @PathVariable Long actaId,
                                      @Valid @RequestBody ObservarActaRequest request,
                                      BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errores);
        }
        try {
            return ResponseEntity.ok(notaService.observarActa(admin, actaId, request.getObservacion()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
