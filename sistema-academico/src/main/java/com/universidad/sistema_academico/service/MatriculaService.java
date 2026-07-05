package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.CursoDisponibleResponse;
import com.universidad.sistema_academico.dto.CursosDisponiblesResponse;
import com.universidad.sistema_academico.dto.SolicitudMatriculaRequest;
import com.universidad.sistema_academico.dto.ValidarMatriculaRequest;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MatriculaService {

    public static final int MAX_CREDITOS = 22;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @Autowired
    private AsignacionDocenteRepository asignacionRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private DetalleMatriculaRepository detalleRepository;

    @Autowired
    private HorarioRepository horarioRepository;

    @Autowired
    private FichaPdfService fichaPdfService;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private AlmacenamientoService almacenamientoService;

    public CursosDisponiblesResponse cursosDisponibles(Usuario usuario) {
        Estudiante estudiante = buscarEstudiante(usuario);
        PeriodoAcademico periodo = periodoActivo();

        List<AsignacionDocente> asignaciones = asignacionRepository
                .findByPeriodoIdAndCursoEspecialidadIdAndCursoCiclo(
                        periodo.getId(),
                        estudiante.getEspecialidad().getId(),
                        estudiante.getCicloActual());

        List<CursoDisponibleResponse> cursos = new ArrayList<>();
        for (AsignacionDocente asignacion : asignaciones) {
            cursos.add(aCursoDisponible(asignacion));
        }

        return new CursosDisponiblesResponse(
                estudiante.getCicloActual(),
                periodo.getAnio(),
                periodo.getSemestre(),
                MAX_CREDITOS,
                cursos);
    }

    public Optional<Matricula> miMatricula(Usuario usuario) {
        Estudiante estudiante = buscarEstudiante(usuario);
        PeriodoAcademico periodo = periodoActivo();
        return matriculaRepository.findByEstudianteIdAndPeriodoId(estudiante.getId(), periodo.getId());
    }

    public List<CursoDisponibleResponse> cursosDeMatricula(Matricula matricula) {
        List<CursoDisponibleResponse> cursos = new ArrayList<>();
        for (DetalleMatricula detalle : detalleRepository.findByMatriculaId(matricula.getId())) {
            cursos.add(aCursoDisponible(detalle.getAsignacion()));
        }
        return cursos;
    }

    @Transactional
    public Matricula solicitar(Usuario usuario, SolicitudMatriculaRequest request) {
        Estudiante estudiante = buscarEstudiante(usuario);

        if (!estudiante.getCicloActual().equals(request.getCiclo())) {
            throw new RuntimeException("El ciclo enviado no corresponde a tu ciclo actual");
        }

        PeriodoAcademico periodo = periodoRepository
                .findByAnioAndSemestre(request.getAnio(), request.getSemestre())
                .orElseThrow(() -> new RuntimeException("El periodo academico no existe"));

        if (!periodo.isMatriculaAbierta()) {
            throw new RuntimeException("La matricula no esta abierta para este periodo");
        }

        if (matriculaRepository.findByEstudianteIdAndPeriodoId(estudiante.getId(), periodo.getId()).isPresent()) {
            throw new RuntimeException("Ya enviaste una solicitud de matricula para este semestre");
        }

        List<AsignacionDocente> asignaciones = new ArrayList<>();
        int totalCreditos = 0;
        for (Long cursoId : request.getCursosIds()) {
            AsignacionDocente asignacion = asignacionRepository
                    .findFirstByCursoIdAndPeriodoId(cursoId, periodo.getId())
                    .orElseThrow(() -> new RuntimeException("El curso " + cursoId + " no esta disponible en este periodo"));

            Curso curso = asignacion.getCurso();
            if (!curso.getEspecialidad().getId().equals(estudiante.getEspecialidad().getId())) {
                throw new RuntimeException("El curso " + curso.getNombre() + " no pertenece a tu especialidad");
            }

            totalCreditos += curso.getCreditos();
            asignaciones.add(asignacion);
        }

        if (totalCreditos > MAX_CREDITOS) {
            throw new RuntimeException("Superaste el limite de " + MAX_CREDITOS + " creditos");
        }

        Matricula matricula = new Matricula();
        matricula.setEstudiante(estudiante);
        matricula.setPeriodo(periodo);
        matricula.setEstado(EstadoMatricula.PENDIENTE);
        matricula = matriculaRepository.save(matricula);

        for (AsignacionDocente asignacion : asignaciones) {
            DetalleMatricula detalle = new DetalleMatricula();
            detalle.setMatricula(matricula);
            detalle.setAsignacion(asignacion);
            detalleRepository.save(detalle);
        }

        return matricula;
    }

    public List<Matricula> listar(EstadoMatricula estado, Integer anio, String semestre, Long especialidadId) {
        List<Matricula> matriculas = estado != null
                ? matriculaRepository.findByEstadoOrderByFechaSolicitudAsc(estado)
                : matriculaRepository.findAll();

        return matriculas.stream()
                .filter(m -> anio == null || m.getPeriodo().getAnio().equals(anio))
                .filter(m -> semestre == null || m.getPeriodo().getSemestre().equals(semestre))
                .filter(m -> especialidadId == null || m.getEstudiante().getEspecialidad().getId().equals(especialidadId))
                .toList();
    }

    @Transactional
    public Matricula validar(Usuario admin, Long matriculaId, ValidarMatriculaRequest request) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new RuntimeException("La matricula no existe"));

        if (matricula.getEstado() != EstadoMatricula.PENDIENTE) {
            throw new RuntimeException("La solicitud ya fue procesada");
        }

        if (request.getAprobado()) {
            matricula.setEstado(EstadoMatricula.VALIDADA);
            matricula.setObservacion(null);
        } else {
            if (request.getObservacion() == null || request.getObservacion().isBlank()) {
                throw new RuntimeException("Debes indicar el motivo del rechazo");
            }
            matricula.setEstado(EstadoMatricula.RECHAZADA);
            matricula.setObservacion(request.getObservacion());
        }

        matricula.setFechaValidacion(LocalDateTime.now());
        matricula.setValidadaPor(admin);

        return matriculaRepository.save(matricula);
    }

    @Transactional
    public Pago registrarPago(Usuario admin, Long matriculaId, BigDecimal monto, String numeroRecibo,
                              String metodoPago, MultipartFile comprobante) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new RuntimeException("La matricula no existe"));

        if (matricula.getEstado() != EstadoMatricula.VALIDADA) {
            throw new RuntimeException("Solo se puede registrar el pago de una matricula validada");
        }

        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El monto debe ser mayor a cero");
        }

        if (numeroRecibo == null || numeroRecibo.isBlank()) {
            throw new RuntimeException("El numero de recibo es obligatorio");
        }

        if (pagoRepository.findByNumeroRecibo(numeroRecibo).isPresent()) {
            throw new RuntimeException("El numero de recibo ya esta registrado");
        }

        Pago pago = new Pago();
        pago.setMatricula(matricula);
        pago.setMonto(monto);
        pago.setNumeroRecibo(numeroRecibo);
        pago.setMetodoPago(metodoPago);
        pago.setRegistradoPor(admin);

        if (comprobante != null && !comprobante.isEmpty()) {
            pago.setComprobanteUrl(almacenamientoService.guardarComprobante(comprobante));
        }

        matricula.setEstado(EstadoMatricula.PAGADA);
        matriculaRepository.save(matricula);

        return pagoRepository.save(pago);
    }

    public List<CursoDisponibleResponse> cursosDeMatricula(Long matriculaId) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new RuntimeException("La matricula no existe"));
        return cursosDeMatricula(matricula);
    }

    public Pago pagoDeMatricula(Long matriculaId) {
        return pagoRepository.findByMatriculaId(matriculaId).orElse(null);
    }

    public Matricula matriculaDelEstudiante(Usuario usuario, Long matriculaId) {
        Estudiante estudiante = buscarEstudiante(usuario);
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new RuntimeException("La matricula no existe"));

        if (!matricula.getEstudiante().getId().equals(estudiante.getId())) {
            throw new RuntimeException("No tienes acceso a esta matricula");
        }
        return matricula;
    }

    public byte[] fichaPdf(Matricula matricula) {
        return fichaPdfService.generar(matricula, cursosDeMatricula(matricula));
    }

    private Estudiante buscarEstudiante(Usuario usuario) {
        return estudianteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("No se encontro el perfil de estudiante"));
    }

    private PeriodoAcademico periodoActivo() {
        return periodoRepository.findByActivoTrue()
                .orElseThrow(() -> new RuntimeException("No hay un periodo academico activo"));
    }

    private CursoDisponibleResponse aCursoDisponible(AsignacionDocente asignacion) {
        DateTimeFormatter hora = DateTimeFormatter.ofPattern("HH:mm");
        List<String> horarios = new ArrayList<>();
        for (Horario h : horarioRepository.findByAsignacionId(asignacion.getId())) {
            String aula = h.getAula() != null ? " " + h.getAula() : "";
            horarios.add(h.getDia() + " " + h.getHoraInicio().format(hora) + "-" + h.getHoraFin().format(hora) + aula);
        }

        Usuario usuarioDocente = asignacion.getDocente().getUsuario();
        Curso curso = asignacion.getCurso();

        return new CursoDisponibleResponse(
                curso.getId(),
                curso.getCodigo(),
                curso.getNombre(),
                curso.getCreditos(),
                usuarioDocente.getNombres() + " " + usuarioDocente.getApellidos(),
                asignacion.getSeccion(),
                horarios);
    }
}
