package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.LogAuditoriaResponse;
import com.universidad.sistema_academico.dto.PaginaResponse;
import com.universidad.sistema_academico.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/auditoria")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AuditoriaController {

    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<PaginaResponse<LogAuditoriaResponse>> listar(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(auditoriaService.listar(usuarioId, modulo, desde, hasta, page, size));
    }
}
