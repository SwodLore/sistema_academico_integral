package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.PeriodoRequest;
import com.universidad.sistema_academico.entity.PeriodoAcademico;
import com.universidad.sistema_academico.repository.PeriodoAcademicoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/periodos")
public class PeriodoController {

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @GetMapping
    public ResponseEntity<?> listarPeriodos() {
        try {
            return ResponseEntity.ok(periodoRepository.findAll(Sort.by(
                    Sort.Order.desc("anio"),
                    Sort.Order.desc("semestre")
            )));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crear(@Valid @RequestBody PeriodoRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            String semestre = request.getSemestre().trim().toUpperCase();
            if (!semestre.equals("I") && !semestre.equals("II")) {
                throw new RuntimeException("El semestre debe ser 'I' o 'II'");
            }
            if (periodoRepository.findByAnioAndSemestre(request.getAnio(), semestre).isPresent()) {
                throw new RuntimeException("Ya existe el periodo " + request.getAnio() + "-" + semestre);
            }

            PeriodoAcademico periodo = new PeriodoAcademico();
            periodo.setAnio(request.getAnio());
            periodo.setSemestre(semestre);
            periodo.setCodigo(request.getAnio() + "-" + semestre);
            periodo.setFechaInicio(request.getFechaInicio() != null ? request.getFechaInicio()
                    : LocalDate.of(request.getAnio(), semestre.equals("I") ? 3 : 8, 1));
            periodo.setFechaFin(request.getFechaFin() != null ? request.getFechaFin()
                    : LocalDate.of(request.getAnio(), semestre.equals("I") ? 7 : 12, 15));
            periodo.setActivo(false);
            periodo.setMatriculaAbierta(false);
            return ResponseEntity.ok(periodoRepository.save(periodo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody PeriodoRequest request,
                                    BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            PeriodoAcademico periodo = periodoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("El periodo no existe"));
            periodo.setFechaInicio(request.getFechaInicio());
            periodo.setFechaFin(request.getFechaFin());
            return ResponseEntity.ok(periodoRepository.save(periodo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Marca este periodo como activo y desactiva cualquier otro (solo uno activo a la vez) */
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> activar(@PathVariable Long id) {
        try {
            PeriodoAcademico periodo = periodoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("El periodo no existe"));

            periodoRepository.findAll().forEach(p -> {
                if (p.isActivo() && !p.getId().equals(id)) {
                    p.setActivo(false);
                    periodoRepository.save(p);
                }
            });

            periodo.setActivo(true);
            return ResponseEntity.ok(periodoRepository.save(periodo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/matricula")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> matricula(@PathVariable Long id, @RequestParam boolean abierta) {
        try {
            PeriodoAcademico periodo = periodoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("El periodo no existe"));
            if (abierta && !periodo.isActivo()) {
                throw new RuntimeException("Solo se puede abrir la matrícula de un periodo activo");
            }
            periodo.setMatriculaAbierta(abierta);
            return ResponseEntity.ok(periodoRepository.save(periodo));
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
