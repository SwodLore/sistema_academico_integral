package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.ProcesarSolicitudDocumentoRequest;
import com.universidad.sistema_academico.dto.SolicitudDocumentoRequest;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.EstudianteRepository;
import com.universidad.sistema_academico.repository.SolicitudDocumentoRepository;
import com.universidad.sistema_academico.repository.UsuarioRepository;
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
import java.nio.charset.StandardCharsets;
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

            if (nuevoEstado == EstadoSolicitud.AUTORIZADA) {
                solicitud.setAutorizadaPor(usuario);
                solicitud.setFechaAutorizacion(LocalDateTime.now());
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
                String nombreEstudiante = solicitud.getEstudiante().getUsuario().getNombres() + " " + solicitud.getEstudiante().getUsuario().getApellidos();
                
                byte[] pdfBytes = generarPdfMock(label, nombreEstudiante, solicitud.getCodigoVerificacion());
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

    private byte[] generarPdfMock(String titulo, String estudiante, String codigoVerificacion) {
        String verificationUrl = "http://localhost:8080/api/solicitudes-documento/verificar/" + codigoVerificacion;
        String qrVector = generateQrPdfVector(verificationUrl);

        String textStream = "BT\n" +
                "/F1 18 Tf\n" +
                "50 750 Td\n" +
                "(" + titulo.toUpperCase() + ") Tj\n" +
                "0 -40 Td\n" +
                "/F1 12 Tf\n" +
                "(Estudiante: " + estudiante + ") Tj\n" +
                "0 -30 Td\n" +
                "(Por medio de la presente, se hace constar el registro oficial de este documento) Tj\n" +
                "0 -15 Td\n" +
                "(en el sistema academico de nuestra Facultad.) Tj\n" +
                "0 -40 Td\n" +
                "(Codigo de verificacion: " + codigoVerificacion + ") Tj\n" +
                "0 -30 Td\n" +
                "(Fecha de emision: " + java.time.LocalDate.now().toString() + ") Tj\n" +
                "ET\n" +
                "BT\n" +
                "/F1 8 Tf\n" +
                "440 100 Td\n" +
                "(Documento Valido - Escanee para verificar) Tj\n" +
                "ET\n" +
                qrVector;

        byte[] textStreamBytes = textStream.getBytes(StandardCharsets.UTF_8);
        int streamLength = textStreamBytes.length;

        String header = "%PDF-1.4\n" +
                "1 0 obj\n" +
                "<< /Type /Catalog /Pages 2 0 R >>\n" +
                "endobj\n" +
                "2 0 obj\n" +
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n" +
                "endobj\n" +
                "3 0 obj\n" +
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\n" +
                "endobj\n" +
                "4 0 obj\n" +
                "<< /Length " + streamLength + " >>\n" +
                "stream\n";

        String footer = "\nendstream\n" +
                "endobj\n" +
                "xref\n" +
                "0 5\n" +
                "0000000000 65535 f \n" +
                "0000000009 00000 n \n" +
                "0000000058 00000 n \n" +
                "0000000115 00000 n \n" +
                "0000000282 00000 n \n" +
                "trailer\n" +
                "<< /Size 5 /Root 1 0 R >>\n" +
                "startxref\n" +
                "650\n" +
                "%%EOF";

        byte[] headerBytes = header.getBytes(StandardCharsets.UTF_8);
        byte[] footerBytes = footer.getBytes(StandardCharsets.UTF_8);

        byte[] pdfBytes = new byte[headerBytes.length + textStreamBytes.length + footerBytes.length];
        System.arraycopy(headerBytes, 0, pdfBytes, 0, headerBytes.length);
        System.arraycopy(textStreamBytes, 0, pdfBytes, headerBytes.length, textStreamBytes.length);
        System.arraycopy(footerBytes, 0, pdfBytes, headerBytes.length + textStreamBytes.length, footerBytes.length);

        return pdfBytes;
    }

    private String generateQrPdfVector(String url) {
        try {
            io.nayuki.qrcodegen.QrCode qr = io.nayuki.qrcodegen.QrCode.encodeText(url, io.nayuki.qrcodegen.QrCode.Ecc.MEDIUM);
            StringBuilder sb = new StringBuilder();
            double scale = 2.5;
            double offsetX = 440;
            double offsetY = 120;
            for (int y = 0; y < qr.size; y++) {
                for (int x = 0; x < qr.size; x++) {
                    if (qr.getModule(x, y)) {
                        double px = offsetX + x * scale;
                        double py = offsetY + (qr.size - 1 - y) * scale;
                        sb.append(String.format(Locale.US, "%.1f %.1f %.1f %.1f re\n", px, py, scale, scale));
                    }
                }
            }
            sb.append("f\n");
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private Map<String, String> errores(BindingResult result) {
        Map<String, String> errores = new HashMap<>();
        result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return errores;
    }
}
