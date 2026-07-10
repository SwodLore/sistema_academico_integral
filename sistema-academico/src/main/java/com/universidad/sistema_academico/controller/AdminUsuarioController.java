package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.UsuarioRequest;
import com.universidad.sistema_academico.entity.Rol;
import com.universidad.sistema_academico.service.AdminUsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminUsuarioController {

    @Autowired
    private AdminUsuarioService adminUsuarioService;

    @GetMapping
    public ResponseEntity<?> listar(@RequestParam(required = false) Rol rol) {
        try {
            return ResponseEntity.ok(adminUsuarioService.listar(rol));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody UsuarioRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            return ResponseEntity.ok(adminUsuarioService.crear(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            return ResponseEntity.ok(adminUsuarioService.editar(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        try {
            return ResponseEntity.ok(adminUsuarioService.cambiarEstado(id, activo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private Map<String, String> errores(BindingResult result) {
        Map<String, String> errores = new HashMap<>();
        result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return errores;
    }
}
