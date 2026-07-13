package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.IndicadorEspecialidadDTO;
import com.universidad.sistema_academico.dto.IndicadoresResponse;
import com.universidad.sistema_academico.service.CumplimientoPlanService;
import com.universidad.sistema_academico.service.ExportService;
import com.universidad.sistema_academico.service.IndicadorService;
import com.universidad.sistema_academico.service.MatriculaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exportar")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'DIRECCION')")
public class ExportController {

    @Autowired
    private IndicadorService indicadorService;
    @Autowired
    private MatriculaService matriculaService;
    @Autowired
    private CumplimientoPlanService cumplimientoPlanService;
    @Autowired
    private ExportService exportService;

    @GetMapping("/indicadores")
    public ResponseEntity<?> indicadores(@RequestParam(defaultValue = "pdf") String formato,
                                         @RequestParam(required = false) Integer anio,
                                         @RequestParam(required = false) String semestre) {
        try {
            IndicadoresResponse ind = indicadorService.getIndicadores(anio, semestre);
            List<String> cabeceras = List.of("Especialidad", "Estudiantes", "Calificados",
                    "Promedio", "Aprobados", "Desaprobados", "Tasa aprobación %");
            List<List<String>> filas = new ArrayList<>();
            for (IndicadorEspecialidadDTO e : ind.getEspecialidades()) {
                filas.add(List.of(
                        txt(e.getEspecialidad()),
                        String.valueOf(e.getEstudiantes()),
                        String.valueOf(e.getCursosCalificados()),
                        e.getPromedio() != null ? e.getPromedio().toString() : "—",
                        String.valueOf(e.getAprobados()),
                        String.valueOf(e.getDesaprobados()),
                        e.getTasaAprobacion() != null ? e.getTasaAprobacion().toString() : "0"));
            }
            return responder(formato, "Indicadores Académicos",
                    "Periodo " + ind.getPeriodo(), cabeceras, filas, "indicadores_" + ind.getPeriodo());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/matricula")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> matricula(@RequestParam(defaultValue = "pdf") String formato,
                                       @RequestParam(required = false) Integer anio,
                                       @RequestParam(required = false) String semestre) {
        try {
            Map<String, Object> est = matriculaService.estadisticas(anio, semestre);
            String periodo = String.valueOf(est.get("periodo"));
            List<String> cabeceras = List.of("Especialidad", "Solicitudes", "Matriculados",
                    "En proceso", "Rechazadas");
            List<List<String>> filas = new ArrayList<>();
            for (Map<String, Object> fila : (List<Map<String, Object>>) est.get("porEspecialidad")) {
                filas.add(List.of(
                        txt(fila.get("especialidad")),
                        txt(fila.get("solicitudes")),
                        txt(fila.get("matriculados")),
                        txt(fila.get("pendientes")),
                        txt(fila.get("rechazadas"))));
            }
            return responder(formato, "Estadísticas de Matrícula",
                    "Periodo " + periodo + " · Total " + est.get("total"),
                    cabeceras, filas, "matricula_" + periodo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/cumplimiento")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> cumplimiento(@RequestParam Long especialidadId,
                                          @RequestParam(defaultValue = "pdf") String formato,
                                          @RequestParam(required = false) Integer anio,
                                          @RequestParam(required = false) String semestre) {
        try {
            Map<String, Object> data = cumplimientoPlanService.calcular(especialidadId, anio, semestre);
            String periodo = String.valueOf(data.get("periodo"));
            String especialidad = String.valueOf(data.get("especialidad"));
            Map<String, Object> resumen = (Map<String, Object>) data.get("resumen");

            List<String> cabeceras = List.of("Ciclo", "Código", "Curso", "Docente", "Horario", "Sílabo");
            List<List<String>> filas = new ArrayList<>();
            for (Map<String, Object> c : (List<Map<String, Object>>) data.get("cursos")) {
                filas.add(List.of(
                        txt(c.get("ciclo")),
                        txt(c.get("codigo")),
                        txt(c.get("nombre")),
                        c.get("docente") != null ? txt(c.get("docente")) : "No asignado",
                        siNo(c.get("horario")),
                        siNo(c.get("silabo"))));
            }
            return responder(formato, "Cumplimiento del Plan — " + especialidad,
                    "Periodo " + periodo + " · Cumplimiento " + resumen.get("porcentaje") + "%",
                    cabeceras, filas, "cumplimiento_" + periodo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private ResponseEntity<byte[]> responder(String formato, String titulo, String subtitulo,
                                             List<String> cabeceras, List<List<String>> filas, String nombreBase) {
        boolean pdf = !"csv".equalsIgnoreCase(formato) && !"excel".equalsIgnoreCase(formato);
        byte[] contenido = pdf
                ? exportService.pdf(titulo, subtitulo, cabeceras, filas)
                : exportService.csv(cabeceras, filas);
        String nombre = nombreBase + (pdf ? ".pdf" : ".csv");
        MediaType tipo = pdf ? MediaType.APPLICATION_PDF : MediaType.parseMediaType("text/csv; charset=UTF-8");
        return ResponseEntity.ok()
                .contentType(tipo)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + "\"")
                .body(contenido);
    }

    private String txt(Object valor) {
        return valor != null ? valor.toString() : "";
    }

    private String siNo(Object valor) {
        return Boolean.TRUE.equals(valor) ? "Sí" : "No";
    }
}
