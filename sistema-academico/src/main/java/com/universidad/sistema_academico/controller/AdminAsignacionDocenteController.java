package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.*;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('DIRECCION')")
public class AdminAsignacionDocenteController {

    @Autowired
    private AsignacionDocenteRepository asignacionRepository;

    @Autowired
    private HorarioRepository horarioRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @Autowired
    private DetalleMatriculaRepository detalleMatriculaRepository;

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @Autowired
    private com.universidad.sistema_academico.service.CumplimientoPlanService cumplimientoPlanService;

    @GetMapping("/docentes")
    public List<Docente> listarDocentes() {
        return docenteRepository.findAll();
    }

    @GetMapping("/carga-docente")
    public ResponseEntity<?> getCargaDocentes(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String semestre,
            @RequestParam(required = false) Long especialidadId) {
        try {
            PeriodoAcademico periodo = null;
            if (anio != null && semestre != null && !semestre.trim().isEmpty()) {
                periodo = periodoRepository.findByAnioAndSemestre(anio, semestre)
                        .orElse(null);
            } else {
                periodo = periodoRepository.findByActivoTrue().orElse(null);
            }

            if (periodo == null) {
                return ResponseEntity.ok(List.of());
            }

            List<Docente> docentes = docenteRepository.findAll();
            List<DocenteCargaResumenDTO> result = new ArrayList<>();

            for (Docente docente : docentes) {
                List<AsignacionDocente> asignaciones = asignacionRepository.findByDocenteIdAndPeriodoId(docente.getId(), periodo.getId());

                if (especialidadId != null) {
                    asignaciones = asignaciones.stream()
                            .filter(a -> a.getCurso().getEspecialidad().getId().equals(especialidadId))
                            .collect(Collectors.toList());
                }

                if (especialidadId != null && asignaciones.isEmpty()) {
                    continue;
                }

                int cantidadCursos = asignaciones.size();
                int totalHoras = asignaciones.stream()
                        .mapToInt(a -> a.getCurso().getHorasSemanales())
                        .sum();

                DocenteCargaResumenDTO dto = new DocenteCargaResumenDTO();
                dto.setDocenteId(docente.getId());
                dto.setCodigoDocente(docente.getCodigoDocente());
                dto.setDni(docente.getDni());
                dto.setNombreCompleto(docente.getUsuario().getNombres() + " " + docente.getUsuario().getApellidos());
                dto.setGradoAcademico(docente.getGradoAcademico());
                dto.setFacultadNombre(docente.getFacultad() != null ? docente.getFacultad().getNombre() : "");
                dto.setCantidadCursos(cantidadCursos);
                dto.setTotalHoras(totalHoras);

                result.add(dto);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/carga-docente/{docenteId}")
    public ResponseEntity<?> getDetalleCargaDocente(
            @PathVariable Long docenteId,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String semestre,
            @RequestParam(required = false) Long especialidadId) {
        try {
            Docente docente = docenteRepository.findById(docenteId)
                    .orElseThrow(() -> new RuntimeException("No se encontro el docente"));

            PeriodoAcademico periodo = null;
            if (anio != null && semestre != null && !semestre.trim().isEmpty()) {
                periodo = periodoRepository.findByAnioAndSemestre(anio, semestre)
                        .orElse(null);
            } else {
                periodo = periodoRepository.findByActivoTrue().orElse(null);
            }

            if (periodo == null) {
                return ResponseEntity.ok(new DocenteCargaAcademicaResponse(0, 0, new ArrayList<>()));
            }

            List<AsignacionDocente> asignaciones = asignacionRepository.findByDocenteIdAndPeriodoId(docente.getId(), periodo.getId());

            if (especialidadId != null) {
                asignaciones = asignaciones.stream()
                        .filter(a -> a.getCurso().getEspecialidad().getId().equals(especialidadId))
                        .collect(Collectors.toList());
            }

            int totalCreditos = 0;
            int totalHoras = 0;
            List<CursoAsignadoDTO> cursosDTO = new ArrayList<>();
            DateTimeFormatter horaFormatter = DateTimeFormatter.ofPattern("HH:mm");

            for (AsignacionDocente asignacion : asignaciones) {
                Curso curso = asignacion.getCurso();
                totalCreditos += curso.getCreditos();
                totalHoras += curso.getHorasSemanales();

                List<Horario> horarios = horarioRepository.findByAsignacionId(asignacion.getId());
                List<HorarioDTO> horariosDTO = new ArrayList<>();
                for (Horario h : horarios) {
                    horariosDTO.add(new HorarioDTO(
                            h.getDia().name(),
                            h.getHoraInicio().format(horaFormatter),
                            h.getHoraFin().format(horaFormatter),
                            h.getAula()
                    ));
                }

                CursoAsignadoDTO dto = new CursoAsignadoDTO(
                        asignacion.getId(),
                        curso.getId(),
                        curso.getCodigo(),
                        curso.getNombre(),
                        asignacion.getSeccion(),
                        curso.getCreditos(),
                        curso.getHorasSemanales(),
                        horariosDTO
                );
                dto.setEspecialidadNombre(curso.getEspecialidad().getNombre());
                dto.setCiclo(curso.getCiclo());

                cursosDTO.add(dto);
            }

            return ResponseEntity.ok(new DocenteCargaAcademicaResponse(totalCreditos, totalHoras, cursosDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Direccion/Admin: cumplimiento del plan de estudios de una especialidad en un periodo */
    @GetMapping("/cumplimiento-plan")
    public ResponseEntity<?> cumplimientoPlan(@RequestParam Long especialidadId,
                                              @RequestParam(required = false) Integer anio,
                                              @RequestParam(required = false) String semestre) {
        try {
            return ResponseEntity.ok(cumplimientoPlanService.calcular(especialidadId, anio, semestre));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/asignaciones")
    public List<AsignacionDocenteResponseDTO> listarAsignaciones(
            @RequestParam(required = false) Long especialidadId) {
        List<AsignacionDocente> asignaciones = asignacionRepository.findAll();
        if (especialidadId != null) {
            asignaciones = asignaciones.stream()
                    .filter(a -> a.getCurso().getEspecialidad().getId().equals(especialidadId))
                    .collect(Collectors.toList());
        }
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return asignaciones.stream().map(a -> {
            List<Horario> horarios = horarioRepository.findByAsignacionId(a.getId());
            List<HorarioDTO> horariosDTO = horarios.stream().map(h -> new HorarioDTO(
                    h.getDia().name(),
                    h.getHoraInicio().format(timeFormatter),
                    h.getHoraFin().format(timeFormatter),
                    h.getAula()
            )).collect(Collectors.toList());

            AsignacionDocenteResponseDTO dto = new AsignacionDocenteResponseDTO(
                    a.getId(),
                    a.getCurso(),
                    a.getDocente(),
                    a.getPeriodo(),
                    a.getSeccion(),
                    horariosDTO
            );
            dto.setCupos(a.getCupos());
            dto.setMatriculados((int) detalleMatriculaRepository
                    .countByAsignacionIdAndMatriculaEstadoNot(a.getId(), EstadoMatricula.RECHAZADA));
            return dto;
        }).collect(Collectors.toList());
    }

    @PostMapping("/asignaciones")
    @Transactional
    public ResponseEntity<?> crear(@Valid @RequestBody AsignacionDocenteRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            PeriodoAcademico periodo = resolverPeriodo(request.getAnio(), request.getSemestre());
            validarConflictoAsignacion(request.getCursoId(), periodo.getId(), request.getSeccion(), null);
            validarConflictosHorarios(request.getDocenteId(), request.getHorarios(), periodo.getId(), null);

            Curso curso = cursoRepository.findById(request.getCursoId())
                    .orElseThrow(() -> new RuntimeException("El curso no existe"));
            Docente docente = docenteRepository.findById(request.getDocenteId())
                    .orElseThrow(() -> new RuntimeException("El docente no existe"));
            validarFacultadDocente(docente, curso);

            AsignacionDocente asignacion = new AsignacionDocente();
            asignacion.setCurso(curso);
            asignacion.setDocente(docente);
            asignacion.setPeriodo(periodo);
            asignacion.setSeccion(request.getSeccion());
            asignacion.setCupos(request.getCupos() != null ? request.getCupos() : 30);
            AsignacionDocente guardada = asignacionRepository.save(asignacion);

            guardarHorarios(guardada, request.getHorarios());

            return ResponseEntity.ok(Map.of("message", "Asignación docente creada correctamente", "id", guardada.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/asignaciones/{id}")
    @Transactional
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody AsignacionDocenteRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            AsignacionDocente asignacion = asignacionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("La asignación no existe"));

            PeriodoAcademico periodo = resolverPeriodo(request.getAnio(), request.getSemestre());
            validarConflictoAsignacion(request.getCursoId(), periodo.getId(), request.getSeccion(), id);
            validarConflictosHorarios(request.getDocenteId(), request.getHorarios(), periodo.getId(), id);

            Curso curso = cursoRepository.findById(request.getCursoId())
                    .orElseThrow(() -> new RuntimeException("El curso no existe"));
            Docente docente = docenteRepository.findById(request.getDocenteId())
                    .orElseThrow(() -> new RuntimeException("El docente no existe"));
            validarFacultadDocente(docente, curso);

            asignacion.setCurso(curso);
            asignacion.setDocente(docente);
            asignacion.setPeriodo(periodo);
            asignacion.setSeccion(request.getSeccion());
            if (request.getCupos() != null) {
                asignacion.setCupos(request.getCupos());
            }
            AsignacionDocente guardada = asignacionRepository.save(asignacion);

            // Eliminar horarios anteriores
            List<Horario> horariosViejos = horarioRepository.findByAsignacionId(id);
            horarioRepository.deleteAll(horariosViejos);

            // Guardar nuevos horarios
            guardarHorarios(guardada, request.getHorarios());

            return ResponseEntity.ok(Map.of("message", "Asignación docente actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/asignaciones/{id}")
    @Transactional
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            AsignacionDocente asignacion = asignacionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("La asignación no existe"));

            if (!detalleMatriculaRepository.findByAsignacionId(id).isEmpty()) {
                throw new RuntimeException("No se puede eliminar esta asignación porque ya cuenta con estudiantes matriculados.");
            }

            List<Horario> horarios = horarioRepository.findByAsignacionId(id);
            horarioRepository.deleteAll(horarios);

            asignacionRepository.delete(asignacion);
            return ResponseEntity.ok(Map.of("message", "Asignación docente y sus horarios eliminados correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** El docente debe pertenecer a la facultad de la especialidad del curso */
    private void validarFacultadDocente(Docente docente, Curso curso) {
        Facultad facultadCurso = curso.getEspecialidad().getFacultad();
        if (docente.getFacultad() == null || !docente.getFacultad().getId().equals(facultadCurso.getId())) {
            throw new RuntimeException("El docente pertenece a otra facultad: este curso requiere un docente de la "
                    + facultadCurso.getNombre());
        }
    }

    private PeriodoAcademico resolverPeriodo(Integer anio, String semestre) {
        return periodoRepository.findByAnioAndSemestre(anio, semestre)
                .orElseGet(() -> {
                    PeriodoAcademico p = new PeriodoAcademico();
                    p.setAnio(anio);
                    p.setSemestre(semestre);
                    p.setCodigo(anio + "-" + semestre);
                    p.setFechaInicio(java.time.LocalDate.of(anio, semestre.equals("I") ? 3 : 8, 1));
                    p.setFechaFin(java.time.LocalDate.of(anio, semestre.equals("I") ? 7 : 12, 15));
                    p.setActivo(false);
                    p.setMatriculaAbierta(false);
                    return periodoRepository.save(p);
                });
    }

    private void validarConflictoAsignacion(Long cursoId, Long periodoId, String seccion, Long excludeId) {
        Optional<AsignacionDocente> existente = asignacionRepository.findByCursoIdAndPeriodoIdAndSeccion(cursoId, periodoId, seccion);
        if (existente.isPresent() && (excludeId == null || !existente.get().getId().equals(excludeId))) {
            throw new RuntimeException("Ya existe una asignación para el curso '" + existente.get().getCurso().getNombre() + "' en la sección '" + seccion + "' para este periodo.");
        }
    }

    private void validarConflictosHorarios(Long docenteId, List<HorarioRequest> nuevosHorarios, Long periodoId, Long excludeId) {
        if (nuevosHorarios == null || nuevosHorarios.isEmpty()) {
            return;
        }

        // 1. Validar consistencia interna de la solicitud
        for (int i = 0; i < nuevosHorarios.size(); i++) {
            HorarioRequest h1 = nuevosHorarios.get(i);
            LocalTime start1 = LocalTime.parse(h1.getHoraInicio());
            LocalTime end1 = LocalTime.parse(h1.getHoraFin());

            if (start1.isAfter(end1) || start1.equals(end1)) {
                throw new RuntimeException("La hora de inicio (" + h1.getHoraInicio() + ") debe ser anterior a la hora de fin (" + h1.getHoraFin() + ").");
            }

            for (int j = i + 1; j < nuevosHorarios.size(); j++) {
                HorarioRequest h2 = nuevosHorarios.get(j);
                if (h1.getDia().equals(h2.getDia())) {
                    LocalTime start2 = LocalTime.parse(h2.getHoraInicio());
                    LocalTime end2 = LocalTime.parse(h2.getHoraFin());
                    if (start1.isBefore(end2) && end1.isAfter(start2)) {
                        throw new RuntimeException("Conflicto interno: Has especificado dos horarios que se cruzan el día " + h1.getDia());
                    }
                }
            }
        }

        // 2. Validar contra la base de datos para el periodo académico
        List<Horario> horariosExistentes = horarioRepository.findByAsignacionPeriodoId(periodoId);

        for (HorarioRequest req : nuevosHorarios) {
            LocalTime reqStart = LocalTime.parse(req.getHoraInicio());
            LocalTime reqEnd = LocalTime.parse(req.getHoraFin());

            for (Horario existing : horariosExistentes) {
                // Si estamos editando, omitir los horarios de la misma asignación
                if (excludeId != null && existing.getAsignacion().getId().equals(excludeId)) {
                    continue;
                }

                if (existing.getDia().name().equals(req.getDia())) {
                    boolean overlap = reqStart.isBefore(existing.getHoraFin()) && reqEnd.isAfter(existing.getHoraInicio());
                    if (overlap) {
                        // Cruce de Docente
                        if (existing.getAsignacion().getDocente().getId().equals(docenteId)) {
                            throw new RuntimeException("Conflicto de horario para el docente: el docente ya enseña el curso '"
                                    + existing.getAsignacion().getCurso().getNombre() + "' (Sección " + existing.getAsignacion().getSeccion()
                                    + ") el " + req.getDia() + " de " + existing.getHoraInicio() + " a " + existing.getHoraFin());
                        }

                        // Cruce de Aula
                        if (req.getAula() != null && !req.getAula().trim().isEmpty()
                                && existing.getAula() != null && existing.getAula().trim().equalsIgnoreCase(req.getAula().trim())) {
                            throw new RuntimeException("Conflicto de aula: el aula '" + req.getAula() + "' ya está ocupada por el curso '"
                                    + existing.getAsignacion().getCurso().getNombre() + "' (Sección " + existing.getAsignacion().getSeccion()
                                    + ") el " + req.getDia() + " de " + existing.getHoraInicio() + " a " + existing.getHoraFin());
                        }
                    }
                }
            }
        }
    }

    private void guardarHorarios(AsignacionDocente asignacion, List<HorarioRequest> reqs) {
        if (reqs == null) return;
        for (HorarioRequest r : reqs) {
            Horario h = new Horario();
            h.setAsignacion(asignacion);
            h.setDia(DiaSemana.valueOf(r.getDia()));
            h.setHoraInicio(LocalTime.parse(r.getHoraInicio()));
            h.setHoraFin(LocalTime.parse(r.getHoraFin()));
            h.setAula(r.getAula());
            horarioRepository.save(h);
        }
    }

    private Map<String, String> errores(BindingResult result) {
        Map<String, String> errores = new HashMap<>();
        result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return errores;
    }
}
