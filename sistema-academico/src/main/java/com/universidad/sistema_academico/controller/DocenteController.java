package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.service.DocenteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/docentes")
@PreAuthorize("hasRole('DOCENTE')")
public class DocenteController {

    @Autowired
    private DocenteService docenteService;

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
}
