package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.ReporteConsolidadoResponse;
import com.universidad.sistema_academico.dto.ReporteEstudianteDTO;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Reporte consolidado de rendimiento por especialidad y periodo (HU-20).
 */
@Service
public class ReporteService {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private DetalleMatriculaRepository detalleRepository;

    @Autowired
    private NotaRepository notaRepository;

    public ReporteConsolidadoResponse generar(Long especialidadId, Integer anio, String semestre) {
        Especialidad especialidad = especialidadRepository.findById(especialidadId)
                .orElseThrow(() -> new RuntimeException("La especialidad no existe"));
        PeriodoAcademico periodo = resolverPeriodo(anio, semestre);

        ReporteConsolidadoResponse response = new ReporteConsolidadoResponse();
        response.setEspecialidadId(especialidad.getId());
        response.setEspecialidad(especialidad.getNombre());
        response.setPeriodo(periodo.getAnio() + "-" + periodo.getSemestre());
        response.setAnio(periodo.getAnio());
        response.setSemestre(periodo.getSemestre());

        List<ReporteEstudianteDTO> estudiantes = new ArrayList<>();
        int aprobados = 0;
        int desaprobados = 0;
        int enCurso = 0;
        BigDecimal sumaPromedios = BigDecimal.ZERO;
        int conPromedio = 0;

        for (Matricula matricula : matriculaRepository.findByPeriodoId(periodo.getId())) {
            // Solo estudiantes de la especialidad seleccionada y con matricula confirmada
            if (!matricula.getEstudiante().getEspecialidad().getId().equals(especialidadId)) {
                continue;
            }
            if (matricula.getEstado() == EstadoMatricula.PENDIENTE
                    || matricula.getEstado() == EstadoMatricula.RECHAZADA) {
                continue;
            }

            ReporteEstudianteDTO dto = construirFila(matricula);
            estudiantes.add(dto);

            switch (dto.getSituacion()) {
                case "Aprobado" -> aprobados++;
                case "Desaprobado" -> desaprobados++;
                default -> enCurso++;
            }
            if (dto.getPromedio() != null) {
                sumaPromedios = sumaPromedios.add(dto.getPromedio());
                conPromedio++;
            }
        }

        estudiantes.sort(Comparator.comparing(ReporteEstudianteDTO::getNombre));

        response.setEstudiantes(estudiantes);
        response.setTotalEstudiantes(estudiantes.size());
        response.setAprobados(aprobados);
        response.setDesaprobados(desaprobados);
        response.setEnCurso(enCurso);
        if (conPromedio > 0) {
            response.setPromedioGeneral(
                    sumaPromedios.divide(BigDecimal.valueOf(conPromedio), 2, RoundingMode.HALF_UP));
        }
        return response;
    }

    private ReporteEstudianteDTO construirFila(Matricula matricula) {
        Estudiante estudiante = matricula.getEstudiante();
        Usuario usuario = estudiante.getUsuario();

        int creditos = 0;
        int cursos = 0;
        int aprobados = 0;
        int desaprobados = 0;
        int pendientes = 0;
        int creditosCalificados = 0;
        BigDecimal sumaPonderada = BigDecimal.ZERO;

        for (DetalleMatricula detalle : detalleRepository.findByMatriculaId(matricula.getId())) {
            Curso curso = detalle.getAsignacion().getCurso();
            Nota nota = notaRepository.findByDetalleId(detalle.getId()).orElse(null);
            EstadoNota estado = nota != null ? nota.getEstado() : EstadoNota.PENDIENTE;

            cursos++;
            creditos += curso.getCreditos();
            if (estado == EstadoNota.APROBADO) aprobados++;
            else if (estado == EstadoNota.DESAPROBADO) desaprobados++;
            else pendientes++;

            if (nota != null && nota.getPromedio() != null) {
                sumaPonderada = sumaPonderada.add(nota.getPromedio().multiply(BigDecimal.valueOf(curso.getCreditos())));
                creditosCalificados += curso.getCreditos();
            }
        }

        BigDecimal promedio = creditosCalificados > 0
                ? sumaPonderada.divide(BigDecimal.valueOf(creditosCalificados), 2, RoundingMode.HALF_UP)
                : null;

        ReporteEstudianteDTO dto = new ReporteEstudianteDTO();
        dto.setCodigo(estudiante.getCodigoEstudiante());
        dto.setNombre(usuario.getApellidos() + " " + usuario.getNombres());
        dto.setCreditos(creditos);
        dto.setCursos(cursos);
        dto.setAprobados(aprobados);
        dto.setDesaprobados(desaprobados);
        dto.setPendientes(pendientes);
        dto.setPromedio(promedio);
        dto.setSituacion(situacionDe(promedio, pendientes));
        return dto;
    }

    private String situacionDe(BigDecimal promedio, int pendientes) {
        if (promedio == null) return "Sin notas";
        if (pendientes > 0) return "En curso";
        return promedio.compareTo(NotaService.NOTA_MINIMA) >= 0 ? "Aprobado" : "Desaprobado";
    }

    // CSV separado por ';' con BOM UTF-8 para que Excel lo abra directamente
    public byte[] generarCsv(ReporteConsolidadoResponse reporte) {
        StringBuilder sb = new StringBuilder();
        sb.append('﻿'); // BOM
        sb.append("Reporte consolidado de rendimiento\n");
        sb.append("Especialidad;").append(escapar(reporte.getEspecialidad())).append('\n');
        sb.append("Periodo;").append(reporte.getPeriodo()).append('\n');
        sb.append("Total estudiantes;").append(reporte.getTotalEstudiantes()).append('\n');
        sb.append("Promedio general;").append(reporte.getPromedioGeneral() != null ? reporte.getPromedioGeneral() : "-").append('\n');
        sb.append('\n');
        sb.append("Codigo;Estudiante;Creditos;Cursos;Aprobados;Desaprobados;Pendientes;Promedio;Situacion\n");
        for (ReporteEstudianteDTO e : reporte.getEstudiantes()) {
            sb.append(escapar(e.getCodigo())).append(';')
              .append(escapar(e.getNombre())).append(';')
              .append(e.getCreditos()).append(';')
              .append(e.getCursos()).append(';')
              .append(e.getAprobados()).append(';')
              .append(e.getDesaprobados()).append(';')
              .append(e.getPendientes()).append(';')
              .append(e.getPromedio() != null ? e.getPromedio() : "-").append(';')
              .append(escapar(e.getSituacion())).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapar(String valor) {
        if (valor == null) return "";
        // Evita romper columnas si el texto trae ';' o comillas
        if (valor.contains(";") || valor.contains("\"") || valor.contains("\n")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }

    private PeriodoAcademico resolverPeriodo(Integer anio, String semestre) {
        if (anio != null && semestre != null && !semestre.isBlank()) {
            return periodoRepository.findByAnioAndSemestre(anio, semestre)
                    .orElseThrow(() -> new RuntimeException("El periodo academico no existe"));
        }
        return periodoRepository.findByActivoTrue()
                .orElseThrow(() -> new RuntimeException("No hay un periodo academico activo"));
    }
}
