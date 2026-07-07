package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.ActaNotasResponse;
import com.universidad.sistema_academico.dto.HojaNotasResponse;
import com.universidad.sistema_academico.dto.NotaCursoDTO;
import com.universidad.sistema_academico.dto.NotaEstudianteDTO;
import com.universidad.sistema_academico.dto.RegistrarNotasRequest;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class NotaService {

    // Pesos de la formula del promedio final (deben sumar 100)
    public static final int PESO_PARCIAL1 = 25;
    public static final int PESO_PARCIAL2 = 25;
    public static final int PESO_PRACTICAS = 20;
    public static final int PESO_NOTA_FINAL = 30;

    // Nota minima aprobatoria
    public static final BigDecimal NOTA_MINIMA = new BigDecimal("10.5");
    public static final BigDecimal NOTA_MIN = BigDecimal.ZERO;
    public static final BigDecimal NOTA_MAX = new BigDecimal("20");

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private AsignacionDocenteRepository asignacionRepository;

    @Autowired
    private DetalleMatriculaRepository detalleRepository;

    @Autowired
    private NotaRepository notaRepository;

    @Autowired
    private ActaNotaRepository actaRepository;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    // Hoja de notas del estudiante para el periodo academico activo (HU-16)
    public HojaNotasResponse getHojaNotas(Usuario usuario) {
        Estudiante estudiante = estudianteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("No se encontro el perfil de estudiante"));
        PeriodoAcademico periodo = periodoRepository.findByActivoTrue()
                .orElseThrow(() -> new RuntimeException("No hay un periodo academico activo"));

        HojaNotasResponse response = new HojaNotasResponse();
        response.setPeriodo(periodo.getAnio() + "-" + periodo.getSemestre());
        response.setCiclo(estudiante.getCicloActual());
        response.setPesoParcial1(PESO_PARCIAL1);
        response.setPesoParcial2(PESO_PARCIAL2);
        response.setPesoPracticas(PESO_PRACTICAS);
        response.setPesoNotaFinal(PESO_NOTA_FINAL);

        Optional<Matricula> matriculaOpt = matriculaRepository
                .findByEstudianteIdAndPeriodoId(estudiante.getId(), periodo.getId());
        if (matriculaOpt.isEmpty()) {
            response.setTieneMatricula(false);
            return response;
        }

        Matricula matricula = matriculaOpt.get();
        response.setTieneMatricula(true);
        response.setMatriculaEstado(matricula.getEstado().name());

        // Los cursos y notas solo aplican si la matricula ya fue confirmada
        if (matricula.getEstado() == EstadoMatricula.PENDIENTE
                || matricula.getEstado() == EstadoMatricula.RECHAZADA) {
            return response;
        }

        int aprobados = 0;
        int desaprobados = 0;
        int pendientes = 0;
        int totalCreditos = 0;
        int creditosAprobados = 0;
        int creditosCalificados = 0;
        BigDecimal sumaPonderada = BigDecimal.ZERO;

        List<NotaCursoDTO> cursos = new ArrayList<>();
        for (DetalleMatricula detalle : detalleRepository.findByMatriculaId(matricula.getId())) {
            AsignacionDocente asignacion = detalle.getAsignacion();
            Curso curso = asignacion.getCurso();
            Usuario usuarioDocente = asignacion.getDocente().getUsuario();
            Nota nota = notaRepository.findByDetalleId(detalle.getId()).orElse(null);
            ActaNota acta = actaRepository.findByAsignacionId(asignacion.getId()).orElse(null);

            EstadoNota estado = nota != null ? nota.getEstado() : EstadoNota.PENDIENTE;
            int creditos = curso.getCreditos();
            totalCreditos += creditos;

            if (estado == EstadoNota.APROBADO) {
                aprobados++;
                creditosAprobados += creditos;
            } else if (estado == EstadoNota.DESAPROBADO) {
                desaprobados++;
            } else {
                pendientes++;
            }

            BigDecimal promedio = nota != null ? nota.getPromedio() : null;
            if (promedio != null) {
                sumaPonderada = sumaPonderada.add(promedio.multiply(BigDecimal.valueOf(creditos)));
                creditosCalificados += creditos;
            }

            cursos.add(new NotaCursoDTO(
                    curso.getCodigo(),
                    curso.getNombre(),
                    creditos,
                    asignacion.getSeccion(),
                    usuarioDocente.getNombres() + " " + usuarioDocente.getApellidos(),
                    nota != null ? nota.getParcial1() : null,
                    nota != null ? nota.getParcial2() : null,
                    nota != null ? nota.getPracticas() : null,
                    nota != null ? nota.getNotaFinal() : null,
                    promedio,
                    estado.name(),
                    acta != null ? acta.getEstado().name() : EstadoActa.ABIERTA.name()
            ));
        }

        cursos.sort(Comparator.comparing(NotaCursoDTO::getCursoNombre));

        response.setCursos(cursos);
        response.setTotalCursos(cursos.size());
        response.setAprobados(aprobados);
        response.setDesaprobados(desaprobados);
        response.setPendientes(pendientes);
        response.setTotalCreditos(totalCreditos);
        response.setCreditosAprobados(creditosAprobados);
        if (creditosCalificados > 0) {
            response.setPromedioPonderado(
                    sumaPonderada.divide(BigDecimal.valueOf(creditosCalificados), 2, RoundingMode.HALF_UP));
        }
        return response;
    }

    public ActaNotasResponse getActa(Usuario usuario, Long asignacionId) {
        AsignacionDocente asignacion = asignacionDelDocente(usuario, asignacionId);
        ActaNota acta = obtenerOCrearActa(asignacion);
        return construirRespuesta(asignacion, acta);
    }

    @Transactional
    public ActaNotasResponse registrarNotas(Usuario usuario, Long asignacionId, RegistrarNotasRequest request) {
        AsignacionDocente asignacion = asignacionDelDocente(usuario, asignacionId);
        ActaNota acta = obtenerOCrearActa(asignacion);

        if (acta.getEstado() != EstadoActa.ABIERTA) {
            throw new RuntimeException("El acta ya fue cerrada y no se pueden modificar las notas");
        }

        if (request.getNotas() == null || request.getNotas().isEmpty()) {
            throw new RuntimeException("No se enviaron notas para registrar");
        }

        for (RegistrarNotasRequest.NotaInput input : request.getNotas()) {
            DetalleMatricula detalle = detalleRepository.findById(input.getDetalleId())
                    .orElseThrow(() -> new RuntimeException("El detalle de matricula no existe"));

            if (!detalle.getAsignacion().getId().equals(asignacionId)) {
                throw new RuntimeException("Uno de los estudiantes no pertenece a este curso");
            }

            validarRango(input.getParcial1(), "Parcial 1");
            validarRango(input.getParcial2(), "Parcial 2");
            validarRango(input.getPracticas(), "Practicas");
            validarRango(input.getNotaFinal(), "Examen final");

            Nota nota = notaRepository.findByDetalleId(detalle.getId()).orElseGet(() -> {
                Nota nueva = new Nota();
                nueva.setDetalle(detalle);
                return nueva;
            });

            nota.setParcial1(input.getParcial1());
            nota.setParcial2(input.getParcial2());
            nota.setPracticas(input.getPracticas());
            nota.setNotaFinal(input.getNotaFinal());

            aplicarPromedioYEstado(nota);
            nota.setFechaActualizacion(LocalDateTime.now());
            notaRepository.save(nota);
        }

        return construirRespuesta(asignacion, acta);
    }

    private AsignacionDocente asignacionDelDocente(Usuario usuario, Long asignacionId) {
        Docente docente = docenteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("No se encontro el perfil de docente para este usuario"));

        AsignacionDocente asignacion = asignacionRepository.findById(asignacionId)
                .orElseThrow(() -> new RuntimeException("La asignacion no existe"));

        if (!asignacion.getDocente().getId().equals(docente.getId())) {
            throw new RuntimeException("No tienes acceso a este curso");
        }
        return asignacion;
    }

    private ActaNota obtenerOCrearActa(AsignacionDocente asignacion) {
        return actaRepository.findByAsignacionId(asignacion.getId()).orElseGet(() -> {
            ActaNota acta = new ActaNota();
            acta.setAsignacion(asignacion);
            acta.setEstado(EstadoActa.ABIERTA);
            return actaRepository.save(acta);
        });
    }

    private void validarRango(BigDecimal valor, String campo) {
        if (valor == null) {
            return;
        }
        if (valor.compareTo(NOTA_MIN) < 0 || valor.compareTo(NOTA_MAX) > 0) {
            throw new RuntimeException("La nota de " + campo + " debe estar entre 0 y 20");
        }
    }

    private void aplicarPromedioYEstado(Nota nota) {
        if (nota.getParcial1() == null || nota.getParcial2() == null
                || nota.getPracticas() == null || nota.getNotaFinal() == null) {
            nota.setPromedio(null);
            nota.setEstado(EstadoNota.PENDIENTE);
            return;
        }

        BigDecimal ponderado = nota.getParcial1().multiply(BigDecimal.valueOf(PESO_PARCIAL1))
                .add(nota.getParcial2().multiply(BigDecimal.valueOf(PESO_PARCIAL2)))
                .add(nota.getPracticas().multiply(BigDecimal.valueOf(PESO_PRACTICAS)))
                .add(nota.getNotaFinal().multiply(BigDecimal.valueOf(PESO_NOTA_FINAL)))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        nota.setPromedio(ponderado);
        nota.setEstado(ponderado.compareTo(NOTA_MINIMA) >= 0 ? EstadoNota.APROBADO : EstadoNota.DESAPROBADO);
    }

    private ActaNotasResponse construirRespuesta(AsignacionDocente asignacion, ActaNota acta) {
        Curso curso = asignacion.getCurso();
        PeriodoAcademico periodo = asignacion.getPeriodo();

        ActaNotasResponse response = new ActaNotasResponse();
        response.setAsignacionId(asignacion.getId());
        response.setCursoCodigo(curso.getCodigo());
        response.setCursoNombre(curso.getNombre());
        response.setSeccion(asignacion.getSeccion());
        response.setPeriodo(periodo.getAnio() + "-" + periodo.getSemestre());
        response.setEstadoActa(acta.getEstado().name());
        response.setEditable(acta.getEstado() == EstadoActa.ABIERTA);
        response.setPesoParcial1(PESO_PARCIAL1);
        response.setPesoParcial2(PESO_PARCIAL2);
        response.setPesoPracticas(PESO_PRACTICAS);
        response.setPesoNotaFinal(PESO_NOTA_FINAL);

        List<NotaEstudianteDTO> estudiantes = new ArrayList<>();
        int aprobados = 0;
        int desaprobados = 0;
        int pendientes = 0;

        List<DetalleMatricula> detalles = detalleRepository.findByAsignacionId(asignacion.getId());
        for (DetalleMatricula detalle : detalles) {
            Matricula matricula = detalle.getMatricula();
            // Solo estudiantes con matricula confirmada (no pendientes ni rechazadas)
            if (matricula.getEstado() == EstadoMatricula.PENDIENTE
                    || matricula.getEstado() == EstadoMatricula.RECHAZADA) {
                continue;
            }

            Estudiante estudiante = matricula.getEstudiante();
            Usuario usuarioEst = estudiante.getUsuario();
            Nota nota = notaRepository.findByDetalleId(detalle.getId()).orElse(null);

            EstadoNota estado = nota != null ? nota.getEstado() : EstadoNota.PENDIENTE;
            if (estado == EstadoNota.APROBADO) aprobados++;
            else if (estado == EstadoNota.DESAPROBADO) desaprobados++;
            else pendientes++;

            estudiantes.add(new NotaEstudianteDTO(
                    detalle.getId(),
                    nota != null ? nota.getId() : null,
                    estudiante.getCodigoEstudiante(),
                    usuarioEst.getApellidos() + " " + usuarioEst.getNombres(),
                    nota != null ? nota.getParcial1() : null,
                    nota != null ? nota.getParcial2() : null,
                    nota != null ? nota.getPracticas() : null,
                    nota != null ? nota.getNotaFinal() : null,
                    nota != null ? nota.getPromedio() : null,
                    estado.name()
            ));
        }

        estudiantes.sort(Comparator.comparing(NotaEstudianteDTO::getNombreCompleto));

        response.setEstudiantes(estudiantes);
        response.setTotalEstudiantes(estudiantes.size());
        response.setAprobados(aprobados);
        response.setDesaprobados(desaprobados);
        response.setPendientes(pendientes);
        return response;
    }
}
