package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.SilaboRequest;
import com.universidad.sistema_academico.dto.SilaboResponse;
import com.universidad.sistema_academico.entity.AsignacionDocente;
import com.universidad.sistema_academico.entity.Docente;
import com.universidad.sistema_academico.entity.Rol;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.repository.AsignacionDocenteRepository;
import com.universidad.sistema_academico.repository.DocenteRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/silabos")
public class SilaboController {

    @Autowired
    private AsignacionDocenteRepository asignacionRepository;

    @Autowired
    private DocenteRepository docenteRepository;

    @GetMapping("/{asignacionId}")
    public ResponseEntity<?> getSilabo(@PathVariable Long asignacionId) {
        try {
            AsignacionDocente asignacion = asignacionRepository.findById(asignacionId)
                    .orElseThrow(() -> new RuntimeException("Asignación de docente no encontrada"));

            Usuario usuarioDocente = asignacion.getDocente().getUsuario();
            SilaboResponse response = new SilaboResponse(
                    asignacion.getId(),
                    asignacion.getCurso().getCodigo(),
                    asignacion.getCurso().getNombre(),
                    asignacion.getSeccion(),
                    usuarioDocente.getNombres() + " " + usuarioDocente.getApellidos(),
                    asignacion.getCompetencias(),
                    asignacion.getContenido(),
                    asignacion.getBibliografia(),
                    asignacion.getFechaCargaSilabo(),
                    asignacion.getSilaboNombre(),
                    asignacion.getSilaboUrl()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{asignacionId}")
    public ResponseEntity<?> putSilabo(
            @PathVariable Long asignacionId,
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody SilaboRequest request,
            BindingResult result) {

        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errores);
        }

        try {
            AsignacionDocente asignacion = asignacionRepository.findById(asignacionId)
                    .orElseThrow(() -> new RuntimeException("Asignación de docente no encontrada"));

            if (usuario.getRol() != Rol.DOCENTE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Solo los docentes pueden cargar el sílabo"));
            }

            Docente docente = docenteRepository.findByUsuarioId(usuario.getId())
                    .orElseThrow(() -> new RuntimeException("Perfil de docente no encontrado"));

            if (!asignacion.getDocente().getId().equals(docente.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "No tienes permisos para modificar el sílabo de esta asignación"));
            }

            asignacion.setCompetencias(request.getCompetencias());
            asignacion.setContenido(request.getContenido());
            asignacion.setBibliografia(request.getBibliografia());
            asignacion.setFechaCargaSilabo(LocalDateTime.now());

            asignacionRepository.save(asignacion);

            Usuario usuarioDocente = asignacion.getDocente().getUsuario();
            SilaboResponse response = new SilaboResponse(
                    asignacion.getId(),
                    asignacion.getCurso().getCodigo(),
                    asignacion.getCurso().getNombre(),
                    asignacion.getSeccion(),
                    usuarioDocente.getNombres() + " " + usuarioDocente.getApellidos(),
                    asignacion.getCompetencias(),
                    asignacion.getContenido(),
                    asignacion.getBibliografia(),
                    asignacion.getFechaCargaSilabo(),
                    asignacion.getSilaboNombre(),
                    asignacion.getSilaboUrl()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/{asignacionId}/pdf", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadPdf(
            @PathVariable Long asignacionId,
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            System.out.println("[SilaboController] Upload PDF para asignacion " + asignacionId);
            System.out.println("[SilaboController] Archivo: " + file.getOriginalFilename() + " size=" + file.getSize() + " type=" + file.getContentType());

            AsignacionDocente asignacion = asignacionRepository.findById(asignacionId)
                    .orElseThrow(() -> new RuntimeException("Asignación de docente no encontrada"));

            if (usuario.getRol() != Rol.DOCENTE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Solo los docentes pueden subir el archivo del sílabo"));
            }

            Docente docente = docenteRepository.findByUsuarioId(usuario.getId())
                    .orElseThrow(() -> new RuntimeException("Perfil de docente no encontrado"));

            if (!asignacion.getDocente().getId().equals(docente.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "No tienes permisos para modificar el sílabo de esta asignación"));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El archivo está vacío"));
            }

            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
            boolean isPdf = "application/pdf".equalsIgnoreCase(contentType)
                    || "application/octet-stream".equalsIgnoreCase(contentType)
                    || originalFilename.toLowerCase().endsWith(".pdf");

            if (!isPdf) {
                return ResponseEntity.badRequest().body(Map.of("message", "Solo se permiten archivos PDF. Tipo recibido: " + contentType));
            }

            java.nio.file.Path uploadRoot = java.nio.file.Paths.get("uploads", "silabos").toAbsolutePath();
            java.nio.file.Files.createDirectories(uploadRoot);

            String safeFilename = originalFilename.isEmpty() ? "silabo.pdf" : originalFilename.replaceAll("[^a-zA-Z0-9._\\-]", "_");
            if (!safeFilename.toLowerCase().endsWith(".pdf")) safeFilename += ".pdf";

            java.nio.file.Path destPath = uploadRoot.resolve(safeFilename);

            try (java.io.InputStream inputStream = file.getInputStream()) {
                java.nio.file.Files.copy(inputStream, destPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }

            System.out.println("[SilaboController] Archivo guardado en: " + destPath.toAbsolutePath());

            asignacion.setSilaboNombre(originalFilename.isEmpty() ? "silabo.pdf" : originalFilename);
            asignacion.setSilaboUrl("/api/silabos/" + asignacionId + "/pdf");
            asignacion.setFechaCargaSilabo(LocalDateTime.now());
            asignacionRepository.save(asignacion);

            return ResponseEntity.ok(Map.of(
                    "silaboNombre", asignacion.getSilaboNombre(),
                    "silaboUrl", asignacion.getSilaboUrl(),
                    "fechaActualizacion", asignacion.getFechaCargaSilabo().toString()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al guardar el archivo: " + e.getMessage()));
        }
    }

    @GetMapping("/{asignacionId}/pdf")
    public ResponseEntity<?> downloadPdf(@PathVariable Long asignacionId) {
        try {
            AsignacionDocente asignacion = asignacionRepository.findById(asignacionId)
                    .orElseThrow(() -> new RuntimeException("Asignación de docente no encontrada"));

            if (asignacion.getSilaboNombre() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "No hay un archivo de sílabo cargado para esta asignación"));
            }

            String storedName = asignacion.getSilaboNombre();
            String safeFilename = storedName.replaceAll("[^a-zA-Z0-9._\\-]", "_");
            if (!safeFilename.toLowerCase().endsWith(".pdf")) safeFilename += ".pdf";

            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", "silabos", safeFilename).toAbsolutePath();
            java.io.File file = filePath.toFile();
            if (!file.exists()) {
                java.nio.file.Path fallback = java.nio.file.Paths.get("uploads", "silabos", asignacionId + ".pdf").toAbsolutePath();
                file = fallback.toFile();
                if (!file.exists()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "El archivo físico no fue encontrado"));
                }
            }

            org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(file);

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + storedName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }
}
