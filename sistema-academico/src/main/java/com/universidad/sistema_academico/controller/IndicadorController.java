package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.service.IndicadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/indicadores")
@PreAuthorize("hasAnyRole('DIRECCION', 'ADMINISTRADOR')")
public class IndicadorController {

    @Autowired
    private IndicadorService indicadorService;

    @GetMapping
    public ResponseEntity<?> indicadores(@RequestParam(required = false) Integer anio,
                                         @RequestParam(required = false) String semestre) {
        try {
            return ResponseEntity.ok(indicadorService.getIndicadores(anio, semestre));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
