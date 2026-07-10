package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.ReporteConsolidadoResponse;
import com.universidad.sistema_academico.service.ReportePdfService;
import com.universidad.sistema_academico.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECCION')")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;

    @Autowired
    private ReportePdfService reportePdfService;

    @GetMapping("/consolidado")
    public ResponseEntity<?> consolidado(@RequestParam Long especialidadId,
                                         @RequestParam(required = false) Integer anio,
                                         @RequestParam(required = false) String semestre) {
        try {
            return ResponseEntity.ok(reporteService.generar(especialidadId, anio, semestre));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/consolidado/pdf")
    public ResponseEntity<?> consolidadoPdf(@RequestParam Long especialidadId,
                                            @RequestParam(required = false) Integer anio,
                                            @RequestParam(required = false) String semestre) {
        try {
            ReporteConsolidadoResponse reporte = reporteService.generar(especialidadId, anio, semestre);
            byte[] pdf = reportePdfService.generar(reporte);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo(reporte, "pdf") + "\"")
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/consolidado/excel")
    public ResponseEntity<?> consolidadoExcel(@RequestParam Long especialidadId,
                                              @RequestParam(required = false) Integer anio,
                                              @RequestParam(required = false) String semestre) {
        try {
            ReporteConsolidadoResponse reporte = reporteService.generar(especialidadId, anio, semestre);
            byte[] csv = reporteService.generarCsv(reporte);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo(reporte, "csv") + "\"")
                    .body(csv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private String nombreArchivo(ReporteConsolidadoResponse reporte, String extension) {
        String periodo = reporte.getPeriodo() != null ? reporte.getPeriodo() : "periodo";
        return "reporte_" + reporte.getEspecialidadId() + "_" + periodo + "." + extension;
    }
}
