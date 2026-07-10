package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.service.CohorteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cohortes")
@PreAuthorize("hasAnyRole('DIRECCION', 'ADMINISTRADOR')")
public class CohorteController {

    @Autowired
    private CohorteService cohorteService;

    @GetMapping
    public ResponseEntity<?> analizar(@RequestParam Integer anioIngreso,
                                      @RequestParam Long especialidadId) {
        try {
            return ResponseEntity.ok(cohorteService.analizar(anioIngreso, especialidadId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
