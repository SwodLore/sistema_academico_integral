package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.EspecialidadRequest;
import com.universidad.sistema_academico.dto.FacultadRequest;
import com.universidad.sistema_academico.entity.Especialidad;
import com.universidad.sistema_academico.entity.Facultad;
import com.universidad.sistema_academico.repository.EspecialidadRepository;
import com.universidad.sistema_academico.repository.FacultadRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class CatalogoController {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @Autowired
    private FacultadRepository facultadRepository;

    @GetMapping("/api/facultades")
    public List<Facultad> facultades() {
        return facultadRepository.findAll();
    }

    @GetMapping("/api/especialidades")
    public List<Especialidad> especialidades() {
        return especialidadRepository.findAll();
    }

    @PostMapping("/api/facultades")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crearFacultad(@Valid @RequestBody FacultadRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            if (facultadRepository.findByCodigo(request.getCodigo()).isPresent()) {
                throw new RuntimeException("Ya existe una facultad con ese codigo");
            }
            Facultad facultad = new Facultad();
            facultad.setCodigo(request.getCodigo());
            facultad.setNombre(request.getNombre());
            return ResponseEntity.ok(facultadRepository.save(facultad));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/api/especialidades")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crearEspecialidad(@Valid @RequestBody EspecialidadRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            if (especialidadRepository.findByCodigo(request.getCodigo()).isPresent()) {
                throw new RuntimeException("Ya existe una especialidad con ese codigo");
            }
            Facultad facultad = facultadRepository.findById(request.getFacultadId())
                    .orElseThrow(() -> new RuntimeException("La facultad no existe"));

            Especialidad especialidad = new Especialidad();
            especialidad.setCodigo(request.getCodigo());
            especialidad.setNombre(request.getNombre());
            especialidad.setFacultad(facultad);
            return ResponseEntity.ok(especialidadRepository.save(especialidad));
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
