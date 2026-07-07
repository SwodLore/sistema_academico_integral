package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.service.NotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/estudiantes")
@PreAuthorize("hasRole('ESTUDIANTE')")
public class EstudianteController {

    @Autowired
    private NotaService notaService;

    @GetMapping("/hoja-notas")
    public ResponseEntity<?> hojaNotas(@AuthenticationPrincipal Usuario usuario) {
        try {
            return ResponseEntity.ok(notaService.getHojaNotas(usuario));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
