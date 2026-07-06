package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.SolicitudMatriculaRequest;
import com.universidad.sistema_academico.dto.ValidarMatriculaRequest;
import com.universidad.sistema_academico.entity.EstadoMatricula;
import com.universidad.sistema_academico.entity.Matricula;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.service.MatriculaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    @Autowired
    private MatriculaService matriculaService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> listar(@RequestParam(required = false) EstadoMatricula estado,
                                    @RequestParam(required = false) Integer anio,
                                    @RequestParam(required = false) String semestre,
                                    @RequestParam(required = false) Long especialidadId) {
        try {
            return ResponseEntity.ok(matriculaService.listar(estado, anio, semestre, especialidadId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/cursos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> cursos(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(matriculaService.cursosDeMatricula(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/ficha-oficial")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> fichaOficial(@PathVariable Long id) {
        try {
            Matricula matricula = matriculaService.prepararFichaOficial(id);
            byte[] pdf = matriculaService.fichaOficialPdf(matricula);

            String nombreArchivo = "ficha_oficial_" + matricula.getEstudiante().getCodigoEstudiante()
                    + "_" + matricula.getPeriodo().getCodigo() + ".pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/cursos-disponibles")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> cursosDisponibles(@AuthenticationPrincipal Usuario usuario) {
        try {
            return ResponseEntity.ok(matriculaService.cursosDisponibles(usuario));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/mi-matricula")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> miMatricula(@AuthenticationPrincipal Usuario usuario) {
        try {
            Optional<Matricula> matricula = matriculaService.miMatricula(usuario);
            if (matricula.isEmpty()) {
                return ResponseEntity.ok(new HashMap<>());
            }
            Map<String, Object> body = new HashMap<>();
            body.put("matricula", matricula.get());
            body.put("cursos", matriculaService.cursosDeMatricula(matricula.get()));
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/ficha")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> ficha(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id) {
        try {
            Matricula matricula = matriculaService.matriculaDelEstudiante(usuario, id);
            byte[] pdf = matriculaService.fichaPdf(matricula);

            String nombreArchivo = "ficha_" + matricula.getEstudiante().getCodigoEstudiante()
                    + "_" + matricula.getPeriodo().getCodigo() + ".pdf";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/solicitar")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> solicitar(@AuthenticationPrincipal Usuario usuario,
                                       @Valid @RequestBody SolicitudMatriculaRequest request,
                                       BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errores);
        }

        try {
            return ResponseEntity.ok(matriculaService.solicitar(usuario, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/pago")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> verPago(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(matriculaService.pagoDeMatricula(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/{id}/pago", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> registrarPago(@AuthenticationPrincipal Usuario usuario,
                                           @PathVariable Long id,
                                           @RequestParam BigDecimal monto,
                                           @RequestParam String numeroRecibo,
                                           @RequestParam(required = false) String metodoPago,
                                           @RequestParam(required = false) MultipartFile comprobante) {
        try {
            return ResponseEntity.ok(matriculaService.registrarPago(usuario, id, monto, numeroRecibo, metodoPago, comprobante));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/validar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> validar(@AuthenticationPrincipal Usuario usuario,
                                     @PathVariable Long id,
                                     @Valid @RequestBody ValidarMatriculaRequest request,
                                     BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errores);
        }

        try {
            return ResponseEntity.ok(matriculaService.validar(usuario, id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
