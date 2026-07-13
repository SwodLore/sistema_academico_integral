package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.entity.AsignacionDocente;
import com.universidad.sistema_academico.entity.Curso;
import com.universidad.sistema_academico.entity.Especialidad;
import com.universidad.sistema_academico.entity.PeriodoAcademico;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/** Cumplimiento del plan de estudios de una especialidad en un periodo (compartido por API y exportación). */
@Service
public class CumplimientoPlanService {

    @Autowired
    private EspecialidadRepository especialidadRepository;
    @Autowired
    private PeriodoAcademicoRepository periodoRepository;
    @Autowired
    private CursoRepository cursoRepository;
    @Autowired
    private AsignacionDocenteRepository asignacionRepository;
    @Autowired
    private HorarioRepository horarioRepository;

    public Map<String, Object> calcular(Long especialidadId, Integer anio, String semestre) {
        Especialidad especialidad = especialidadRepository.findById(especialidadId)
                .orElseThrow(() -> new RuntimeException("La especialidad no existe"));

        PeriodoAcademico periodo = (anio != null && semestre != null && !semestre.trim().isEmpty())
                ? periodoRepository.findByAnioAndSemestre(anio, semestre)
                        .orElseThrow(() -> new RuntimeException("El periodo academico no existe"))
                : periodoRepository.findByActivoTrue()
                        .orElseThrow(() -> new RuntimeException("No hay un periodo academico activo"));

        List<Curso> plan = cursoRepository.findAll().stream()
                .filter(c -> c.getEspecialidad().getId().equals(especialidadId))
                .sorted(Comparator.comparing(Curso::getCiclo).thenComparing(Curso::getCodigo))
                .toList();

        Map<Long, List<AsignacionDocente>> asignacionesPorCurso = asignacionRepository
                .findByPeriodoIdAndCursoEspecialidadId(periodo.getId(), especialidadId).stream()
                .collect(Collectors.groupingBy(a -> a.getCurso().getId()));

        List<Map<String, Object>> cursos = new ArrayList<>();
        int conDocente = 0, conHorario = 0, conSilabo = 0, completos = 0;

        for (Curso curso : plan) {
            List<AsignacionDocente> asignaciones = asignacionesPorCurso.getOrDefault(curso.getId(), List.of());

            boolean docente = !asignaciones.isEmpty();
            boolean horario = asignaciones.stream()
                    .anyMatch(a -> !horarioRepository.findByAsignacionId(a.getId()).isEmpty());
            boolean silabo = asignaciones.stream()
                    .anyMatch(a -> a.getSilaboUrl() != null || a.getFechaCargaSilabo() != null
                            || a.getContenido() != null);

            if (docente) conDocente++;
            if (horario) conHorario++;
            if (silabo) conSilabo++;
            if (docente && horario && silabo) completos++;

            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("cursoId", curso.getId());
            fila.put("codigo", curso.getCodigo());
            fila.put("nombre", curso.getNombre());
            fila.put("ciclo", curso.getCiclo());
            fila.put("docenteAsignado", docente);
            fila.put("docente", docente
                    ? asignaciones.get(0).getDocente().getUsuario().getNombres() + " "
                            + asignaciones.get(0).getDocente().getUsuario().getApellidos()
                    : null);
            fila.put("horario", horario);
            fila.put("silabo", silabo);
            cursos.add(fila);
        }

        int total = plan.size();
        int porcentaje = total == 0 ? 0 : Math.round((conDocente + conHorario + conSilabo) * 100f / (total * 3));

        Map<String, Object> resumen = new LinkedHashMap<>();
        resumen.put("totalCursos", total);
        resumen.put("conDocente", conDocente);
        resumen.put("conHorario", conHorario);
        resumen.put("conSilabo", conSilabo);
        resumen.put("cursosCompletos", completos);
        resumen.put("porcentaje", porcentaje);

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("periodo", periodo.getCodigo());
        respuesta.put("especialidad", especialidad.getNombre());
        respuesta.put("resumen", resumen);
        respuesta.put("cursos", cursos);
        return respuesta;
    }
}
