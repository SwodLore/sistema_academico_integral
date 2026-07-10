package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.CohorteResponse;
import com.universidad.sistema_academico.dto.PuntoEvolucionDTO;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Analisis de desempeño por cohorte de ingreso (HU-21).
 * Una cohorte = estudiantes de una especialidad que ingresaron el mismo año.
 */
@Service
public class CohorteService {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private DetalleMatriculaRepository detalleRepository;

    @Autowired
    private NotaRepository notaRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    public CohorteResponse analizar(Integer anioIngreso, Long especialidadId) {
        Especialidad especialidad = especialidadRepository.findById(especialidadId)
                .orElseThrow(() -> new RuntimeException("La especialidad no existe"));

        int creditosCarrera = creditosDeCarrera(especialidadId);
        Long periodoActivoId = periodoRepository.findByActivoTrue().map(PeriodoAcademico::getId).orElse(null);

        List<Estudiante> cohorte = estudianteRepository
                .findByEspecialidadIdAndAnioIngreso(especialidadId, anioIngreso);

        int activos = 0;
        int egresados = 0;
        int inactivos = 0;
        long sumaCreditosAprobados = 0;

        // Acumuladores de la evolucion del promedio por semestre
        Map<String, EvolucionAcc> evolucion = new LinkedHashMap<>();

        for (Estudiante estudiante : cohorte) {
            int creditosAprobados = 0;
            boolean activoEnPeriodoActual = false;

            for (Matricula matricula : matriculaRepository
                    .findByEstudianteIdOrderByPeriodoAnioAscPeriodoSemestreAsc(estudiante.getId())) {
                if (matricula.getEstado() == EstadoMatricula.PENDIENTE
                        || matricula.getEstado() == EstadoMatricula.RECHAZADA) {
                    continue;
                }
                if (periodoActivoId != null && matricula.getPeriodo().getId().equals(periodoActivoId)) {
                    activoEnPeriodoActual = true;
                }

                int creditosCalificados = 0;
                BigDecimal sumaPonderada = BigDecimal.ZERO;
                for (DetalleMatricula detalle : detalleRepository.findByMatriculaId(matricula.getId())) {
                    Curso curso = detalle.getAsignacion().getCurso();
                    Nota nota = notaRepository.findByDetalleId(detalle.getId()).orElse(null);
                    if (nota == null) continue;

                    if (nota.getEstado() == EstadoNota.APROBADO) {
                        creditosAprobados += curso.getCreditos();
                    }
                    if (nota.getPromedio() != null) {
                        sumaPonderada = sumaPonderada.add(nota.getPromedio().multiply(BigDecimal.valueOf(curso.getCreditos())));
                        creditosCalificados += curso.getCreditos();
                    }
                }

                if (creditosCalificados > 0) {
                    BigDecimal promedioSemestre = sumaPonderada.divide(BigDecimal.valueOf(creditosCalificados), 2, RoundingMode.HALF_UP);
                    PeriodoAcademico periodo = matricula.getPeriodo();
                    String codigo = periodo.getAnio() + "-" + periodo.getSemestre();
                    EvolucionAcc acc = evolucion.computeIfAbsent(codigo,
                            k -> new EvolucionAcc(periodo.getAnio(), periodo.getSemestre()));
                    acc.suma = acc.suma.add(promedioSemestre);
                    acc.count++;
                }
            }

            sumaCreditosAprobados += creditosAprobados;
            boolean egresado = creditosCarrera > 0 && creditosAprobados >= creditosCarrera;
            if (egresado) {
                egresados++;
            } else if (activoEnPeriodoActual) {
                activos++;
            } else {
                inactivos++;
            }
        }

        int ingresantes = cohorte.size();

        CohorteResponse response = new CohorteResponse();
        response.setEspecialidadId(especialidad.getId());
        response.setEspecialidad(especialidad.getNombre());
        response.setAnioIngreso(anioIngreso);
        response.setIngresantes(ingresantes);
        response.setActivos(activos);
        response.setEgresados(egresados);
        response.setInactivos(inactivos);
        response.setCreditosCarrera(creditosCarrera);

        if (ingresantes > 0) {
            response.setTasaRetencion(BigDecimal.valueOf((activos + egresados) * 100L)
                    .divide(BigDecimal.valueOf(ingresantes), 1, RoundingMode.HALF_UP));
            response.setPromedioCreditosAprobados(BigDecimal.valueOf(sumaCreditosAprobados)
                    .divide(BigDecimal.valueOf(ingresantes), 1, RoundingMode.HALF_UP));
        } else {
            response.setTasaRetencion(BigDecimal.ZERO);
            response.setPromedioCreditosAprobados(BigDecimal.ZERO);
        }

        List<EvolucionAcc> ordenados = new ArrayList<>(evolucion.values());
        ordenados.sort(Comparator.comparingInt((EvolucionAcc a) -> a.anio).thenComparing(a -> a.semestre));
        List<PuntoEvolucionDTO> puntos = new ArrayList<>();
        for (EvolucionAcc acc : ordenados) {
            BigDecimal promedio = acc.count > 0
                    ? acc.suma.divide(BigDecimal.valueOf(acc.count), 2, RoundingMode.HALF_UP)
                    : null;
            puntos.add(new PuntoEvolucionDTO(acc.anio + "-" + acc.semestre, promedio, acc.count));
        }
        response.setEvolucion(puntos);

        return response;
    }

    private int creditosDeCarrera(Long especialidadId) {
        int total = 0;
        for (Curso curso : cursoRepository.findByEspecialidadId(especialidadId)) {
            total += curso.getCreditos();
        }
        return total;
    }

    private static class EvolucionAcc {
        final int anio;
        final String semestre;
        BigDecimal suma = BigDecimal.ZERO;
        int count = 0;

        EvolucionAcc(int anio, String semestre) {
            this.anio = anio;
            this.semestre = semestre;
        }
    }
}
