package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.IndicadorEspecialidadDTO;
import com.universidad.sistema_academico.dto.IndicadoresResponse;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Indicadores academicos del semestre para direccion (HU-18).
 * Agrupa el rendimiento por la especialidad del estudiante.
 */
@Service
public class IndicadorService {

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private DetalleMatriculaRepository detalleRepository;

    @Autowired
    private NotaRepository notaRepository;

    public IndicadoresResponse getIndicadores(Integer anio, String semestre) {
        PeriodoAcademico periodo = resolverPeriodo(anio, semestre);

        Map<Long, Acumulador> porEspecialidad = new LinkedHashMap<>();
        Acumulador global = new Acumulador(null);
        Set<Long> estudiantesGlobal = new HashSet<>();

        for (Matricula matricula : matriculaRepository.findByPeriodoId(periodo.getId())) {
            // Solo matriculas confirmadas cuentan para el rendimiento
            if (matricula.getEstado() == EstadoMatricula.PENDIENTE
                    || matricula.getEstado() == EstadoMatricula.RECHAZADA) {
                continue;
            }

            Especialidad especialidad = matricula.getEstudiante().getEspecialidad();
            Acumulador acc = porEspecialidad.computeIfAbsent(
                    especialidad.getId(), id -> new Acumulador(especialidad));

            acc.estudiantes.add(matricula.getEstudiante().getId());
            estudiantesGlobal.add(matricula.getEstudiante().getId());

            for (DetalleMatricula detalle : detalleRepository.findByMatriculaId(matricula.getId())) {
                Nota nota = notaRepository.findByDetalleId(detalle.getId()).orElse(null);
                EstadoNota estado = nota != null ? nota.getEstado() : EstadoNota.PENDIENTE;

                acc.contar(estado);
                global.contar(estado);

                if (nota != null && nota.getPromedio() != null) {
                    acc.acumularPromedio(nota.getPromedio());
                    global.acumularPromedio(nota.getPromedio());
                }
            }
        }

        IndicadoresResponse response = new IndicadoresResponse();
        response.setPeriodo(periodo.getAnio() + "-" + periodo.getSemestre());
        response.setAnio(periodo.getAnio());
        response.setSemestre(periodo.getSemestre());
        response.setTotalEstudiantes(estudiantesGlobal.size());
        response.setTotalCalificados(global.calificados);
        response.setPromedioGeneral(global.promedio());
        response.setAprobados(global.aprobados);
        response.setDesaprobados(global.desaprobados);
        response.setPendientes(global.pendientes);
        response.setTasaAprobacion(global.tasaAprobacion());
        response.setTasaDesaprobacion(global.tasaDesaprobacion());

        List<IndicadorEspecialidadDTO> especialidades = new ArrayList<>();
        for (Acumulador acc : porEspecialidad.values()) {
            especialidades.add(acc.aDTO());
        }
        especialidades.sort(Comparator.comparing(IndicadorEspecialidadDTO::getEspecialidad));
        response.setEspecialidades(especialidades);

        return response;
    }

    private PeriodoAcademico resolverPeriodo(Integer anio, String semestre) {
        if (anio != null && semestre != null && !semestre.isBlank()) {
            return periodoRepository.findByAnioAndSemestre(anio, semestre)
                    .orElseThrow(() -> new RuntimeException("El periodo academico no existe"));
        }
        return periodoRepository.findByActivoTrue()
                .orElseThrow(() -> new RuntimeException("No hay un periodo academico activo"));
    }

    /** Acumulador de conteos y promedios de una especialidad (o global si la especialidad es null). */
    private static class Acumulador {
        final Especialidad especialidad;
        final Set<Long> estudiantes = new HashSet<>();
        int aprobados = 0;
        int desaprobados = 0;
        int pendientes = 0;
        int calificados = 0;
        BigDecimal suma = BigDecimal.ZERO;

        Acumulador(Especialidad especialidad) {
            this.especialidad = especialidad;
        }

        void contar(EstadoNota estado) {
            if (estado == EstadoNota.APROBADO) aprobados++;
            else if (estado == EstadoNota.DESAPROBADO) desaprobados++;
            else pendientes++;
        }

        void acumularPromedio(BigDecimal promedio) {
            suma = suma.add(promedio);
            calificados++;
        }

        BigDecimal promedio() {
            if (calificados == 0) return null;
            return suma.divide(BigDecimal.valueOf(calificados), 2, RoundingMode.HALF_UP);
        }

        BigDecimal tasaAprobacion() {
            return porcentaje(aprobados);
        }

        BigDecimal tasaDesaprobacion() {
            return porcentaje(desaprobados);
        }

        // Porcentaje sobre los cursos ya evaluados (aprobados + desaprobados)
        private BigDecimal porcentaje(int parte) {
            int evaluados = aprobados + desaprobados;
            if (evaluados == 0) return BigDecimal.ZERO;
            return BigDecimal.valueOf(parte)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(evaluados), 1, RoundingMode.HALF_UP);
        }

        IndicadorEspecialidadDTO aDTO() {
            IndicadorEspecialidadDTO dto = new IndicadorEspecialidadDTO();
            dto.setEspecialidadId(especialidad != null ? especialidad.getId() : null);
            dto.setEspecialidad(especialidad != null ? especialidad.getNombre() : "General");
            dto.setEstudiantes(estudiantes.size());
            dto.setCursosCalificados(calificados);
            dto.setPromedio(promedio());
            dto.setAprobados(aprobados);
            dto.setDesaprobados(desaprobados);
            dto.setPendientes(pendientes);
            dto.setTasaAprobacion(tasaAprobacion());
            dto.setTasaDesaprobacion(tasaDesaprobacion());
            return dto;
        }
    }
}
