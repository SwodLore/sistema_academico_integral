package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.ProcesarSolicitudDocumentoRequest;
import com.universidad.sistema_academico.dto.SolicitudDocumentoRequest;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.EstudianteRepository;
import com.universidad.sistema_academico.repository.SolicitudDocumentoRepository;
import com.universidad.sistema_academico.repository.UsuarioRepository;
import com.universidad.sistema_academico.service.CertificadoPdfService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/solicitudes-documento")
public class SolicitudDocumentoController {

    @Autowired
    private SolicitudDocumentoRepository solicitudRepository;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CertificadoPdfService certificadoPdfService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final Map<TipoDocumento, String> TIPO_DOCUMENTO_LABELS = Map.of(
            TipoDocumento.CERTIFICADO_ESTUDIOS, "Certificado de Estudios",
            TipoDocumento.CONSTANCIA_MATRICULA, "Constancia de Matrícula",
            TipoDocumento.CONSTANCIA_NOTAS, "Constancia de Notas",
            TipoDocumento.CONSTANCIA_EGRESADO, "Constancia de Egresado",
            TipoDocumento.CONSTANCIA_TERCIO_SUPERIOR, "Constancia de Tercio Superior"
    );

    @GetMapping("/mis-solicitudes")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> getMisSolicitudes(@AuthenticationPrincipal Usuario usuario) {
        try {
            Estudiante estudiante = estudianteRepository.findByUsuarioId(usuario.getId())
                    .orElseThrow(() -> new RuntimeException("No se encontró el perfil de estudiante"));
            List<SolicitudDocumento> solicitudes = solicitudRepository.findByEstudianteIdOrderByFechaSolicitudDesc(estudiante.getId());
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<?> crearSolicitud(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody SolicitudDocumentoRequest request,
            BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            Estudiante estudiante = estudianteRepository.findByUsuarioId(usuario.getId())
                    .orElseThrow(() -> new RuntimeException("No se encontró el perfil de estudiante"));

            SolicitudDocumento solicitud = new SolicitudDocumento();
            solicitud.setEstudiante(estudiante);
            solicitud.setTipo(request.getTipo());
            solicitud.setMotivo(request.getMotivo());
            solicitud.setEstado(EstadoSolicitud.PENDIENTE);
            solicitud.setFechaSolicitud(LocalDateTime.now());

            SolicitudDocumento guardada = solicitudRepository.save(solicitud);
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('DIRECCION')")
    public ResponseEntity<?> getTodasLasSolicitudes() {
        try {
            List<SolicitudDocumento> solicitudes = solicitudRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaSolicitud"));
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/procesar")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('DIRECCION')")
    public ResponseEntity<?> procesarSolicitud(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody ProcesarSolicitudDocumentoRequest request,
            BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            SolicitudDocumento solicitud = solicitudRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("La solicitud no existe"));

            EstadoSolicitud nuevoEstado = request.getEstado();
            solicitud.setEstado(nuevoEstado);

            if (nuevoEstado == EstadoSolicitud.EN_PROCESO) {
                solicitud.setAutorizadaPor(usuario);
                solicitud.setFechaAutorizacion(LocalDateTime.now());
            } else if (nuevoEstado == EstadoSolicitud.RECHAZADO) {
                solicitud.setMotivoRechazo(request.getMotivoRechazo());
            } else if (nuevoEstado == EstadoSolicitud.LISTO) {
                solicitud.setEmitidaPor(usuario);
                solicitud.setFechaEmision(LocalDateTime.now());
                solicitud.setCodigoVerificacion(UUID.randomUUID().toString());

                // Generate PDF File
                String filename = "constancia_" + id + "_" + System.currentTimeMillis() + ".pdf";
                Path dirPath = Paths.get(uploadDir, "certificados");
                if (!Files.exists(dirPath)) {
                    Files.createDirectories(dirPath);
                }
                Path filePath = dirPath.resolve(filename);

                String label = TIPO_DOCUMENTO_LABELS.getOrDefault(solicitud.getTipo(), "Constancia Académica");
                String urlVerificacion = "http://localhost:8080/api/solicitudes-documento/verificar/"
                        + solicitud.getCodigoVerificacion();

                byte[] pdfBytes = certificadoPdfService.generar(solicitud, label, urlVerificacion);
                Files.write(filePath, pdfBytes);

                solicitud.setDocumentoUrl("/uploads/certificados/" + filename);
            }

            SolicitudDocumento guardada = solicitudRepository.save(solicitud);
            return ResponseEntity.ok(guardada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/verificar/{codigoVerificacion}")
    public ResponseEntity<?> verificarDocumento(@PathVariable String codigoVerificacion) {
        try {
            SolicitudDocumento solicitud = solicitudRepository.findByCodigoVerificacion(codigoVerificacion)
                    .orElseThrow(() -> new RuntimeException("Documento no válido o no registrado"));

            Map<String, Object> data = new HashMap<>();
            data.put("valido", true);
            data.put("tipo", TIPO_DOCUMENTO_LABELS.getOrDefault(solicitud.getTipo(), "Constancia Académica"));
            data.put("estudiante", solicitud.getEstudiante().getUsuario().getNombres() + " " + solicitud.getEstudiante().getUsuario().getApellidos());
            data.put("codigoEstudiante", solicitud.getEstudiante().getCodigoEstudiante());
            data.put("fechaEmision", solicitud.getFechaEmision());
            data.put("codigoVerificacion", solicitud.getCodigoVerificacion());

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("valido", false, "message", e.getMessage()));
        }
    }

    private Map<String, String> errores(BindingResult result) {
        Map<String, String> errores = new HashMap<>();
        result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return errores;
    }
}
