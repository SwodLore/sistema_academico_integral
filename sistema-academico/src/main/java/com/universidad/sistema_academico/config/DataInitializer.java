package com.universidad.sistema_academico.config;

import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private FacultadRepository facultadRepository;
    @Autowired
    private EspecialidadRepository especialidadRepository;
    @Autowired
    private DocenteRepository docenteRepository;
    @Autowired
    private EstudianteRepository estudianteRepository;
    @Autowired
    private CursoRepository cursoRepository;
    @Autowired
    private PeriodoAcademicoRepository periodoAcademicoRepository;
    @Autowired
    private AsignacionDocenteRepository asignacionDocenteRepository;
    @Autowired
    private HorarioRepository horarioRepository;
    @Autowired
    private MatriculaRepository matriculaRepository;
    @Autowired
    private DetalleMatriculaRepository detalleMatriculaRepository;
    @Autowired
    private NotaRepository notaRepository;
    @Autowired
    private SolicitudDocumentoRepository solicitudDocumentoRepository;
    @Autowired
    private LogAuditoriaRepository logAuditoriaRepository;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario admin = crearUsuario("Admin", "Prueba", "admin@test.com", "ADM001", Rol.ADMINISTRADOR);
        crearUsuario("Direccion", "Prueba", "direccion@test.com", "DIR001", Rol.DIRECCION);

        Facultad fis = crearFacultad("FIS", "Facultad de Ingenieria de Sistemas");
        Facultad fic = crearFacultad("FIC", "Facultad de Ingenieria Civil");

        Especialidad isi = crearEspecialidad("ISI", "Ingenieria de Sistemas e Informatica", fis);
        Especialidad ici = crearEspecialidad("ICI", "Ingenieria Civil", fic);

        Docente docente1 = crearDocente("Juan", "Perez Rojas", "docente1@test.com", "DOC001",
                "12345678", "Magister", fis);
        Docente docente2 = crearDocente("Maria", "Lopez Diaz", "docente2@test.com", "DOC002",
                "23456789", "Magister", fis);
        Docente docente3 = crearDocente("Pedro", "Quispe Mamani", "docente3@test.com", "DOC003",
                "34567890", "Doctor", fic);
        Docente docente4 = crearDocente("Rosa", "Flores Campos", "docente4@test.com", "DOC004",
                "45678901", "Magister", fis);

        Estudiante estudiante1 = crearEstudiante("Carlos", "Ramirez Soto", "estudiante1@test.com",
                "EST2024001", "71234567", isi, 3, 2023);
        Estudiante estudiante2 = crearEstudiante("Ana", "Torres Vega", "estudiante2@test.com",
                "EST2024002", "71234568", isi, 1, 2025);
        Estudiante estudiante3 = crearEstudiante("Luis", "Garcia Mendez", "estudiante3@test.com",
                "EST2024003", "71234569", isi, 3, 2023);
        Estudiante estudiante4 = crearEstudiante("Sofia", "Huaman Rivas", "estudiante4@test.com",
                "EST2025004", "71234570", isi, 1, 2025);
        Estudiante estudiante5 = crearEstudiante("Diego", "Castro Nunez", "estudiante5@test.com",
                "EST2023005", "71234571", isi, 3, 2023);
        Estudiante estudiante6 = crearEstudiante("Valeria", "Salas Ponce", "estudiante6@test.com",
                "EST2025006", "71234572", ici, 1, 2025);
        Estudiante estudiante7 = crearEstudiante("Marco", "Rios Palacios", "estudiante7@test.com",
                "EST2021007", "71234573", isi, 5, 2021);
        Estudiante estudiante8 = crearEstudiante("Elena", "Vargas Luna", "estudiante8@test.com",
                "EST2023008", "71234574", isi, 3, 2023);

        Curso isi101 = crearCurso("ISI101", "Introduccion a la Programacion", 4, 6, 1, isi, null);
        Curso isi102 = crearCurso("ISI102", "Matematica Basica", 4, 5, 1, isi, null);
        Curso isi301 = crearCurso("ISI301", "Estructura de Datos", 4, 6, 3, isi, isi101);
        Curso isi302 = crearCurso("ISI302", "Base de Datos I", 4, 5, 3, isi, null);
        Curso isi501 = crearCurso("ISI501", "Ingenieria de Software", 4, 6, 5, isi, null);
        Curso isi502 = crearCurso("ISI502", "Redes de Computadoras", 3, 5, 5, isi, null);
        Curso ici101 = crearCurso("ICI101", "Dibujo de Ingenieria", 3, 5, 1, ici, null);
        Curso ici102 = crearCurso("ICI102", "Fisica I", 4, 6, 1, ici, null);

        PeriodoAcademico periodoAnterior = crearPeriodo("2024-II", 2024, "II",
                LocalDate.of(2024, 8, 1), LocalDate.of(2024, 12, 15), false, false);
        PeriodoAcademico periodoActual = crearPeriodo("2025-I", 2025, "I",
                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 7, 15), true, true);

        // Periodo anterior (historial de notas)
        AsignacionDocente asigIsi101 = crearAsignacion(isi101, docente1, periodoAnterior, "A", 30);
        AsignacionDocente asigIsi102 = crearAsignacion(isi102, docente2, periodoAnterior, "A", 30);

        // Periodo actual: ciclo 3
        AsignacionDocente asigIsi301 = crearAsignacion(isi301, docente1, periodoActual, "A", 30);
        AsignacionDocente asigIsi302 = crearAsignacion(isi302, docente2, periodoActual, "A", 30);
        // Periodo actual: ciclo 1 (isi102Act con 1 cupo para probar "sin vacantes")
        AsignacionDocente asigIsi101Act = crearAsignacion(isi101, docente1, periodoActual, "A", 30);
        AsignacionDocente asigIsi102Act = crearAsignacion(isi102, docente4, periodoActual, "A", 1);
        AsignacionDocente asigIci101Act = crearAsignacion(ici101, docente3, periodoActual, "A", 30);
        AsignacionDocente asigIci102Act = crearAsignacion(ici102, docente3, periodoActual, "A", 30);
        // Periodo actual: ciclo 5
        AsignacionDocente asigIsi501Act = crearAsignacion(isi501, docente4, periodoActual, "A", 30);
        AsignacionDocente asigIsi502Act = crearAsignacion(isi502, docente1, periodoActual, "A", 30);

        crearHorario(asigIsi101, DiaSemana.MIERCOLES, LocalTime.of(8, 0), LocalTime.of(10, 0), "101");
        crearHorario(asigIsi102, DiaSemana.JUEVES, LocalTime.of(8, 0), LocalTime.of(10, 0), "102");
        crearHorario(asigIsi301, DiaSemana.LUNES, LocalTime.of(8, 0), LocalTime.of(10, 0), "201");
        crearHorario(asigIsi302, DiaSemana.MARTES, LocalTime.of(10, 0), LocalTime.of(12, 0), "202");
        crearHorario(asigIsi101Act, DiaSemana.VIERNES, LocalTime.of(8, 0), LocalTime.of(10, 0), "101");
        crearHorario(asigIsi102Act, DiaSemana.VIERNES, LocalTime.of(10, 0), LocalTime.of(12, 0), "102");
        crearHorario(asigIci101Act, DiaSemana.LUNES, LocalTime.of(14, 0), LocalTime.of(16, 0), "301");
        crearHorario(asigIci102Act, DiaSemana.MIERCOLES, LocalTime.of(14, 0), LocalTime.of(16, 0), "302");
        crearHorario(asigIsi501Act, DiaSemana.MARTES, LocalTime.of(14, 0), LocalTime.of(16, 0), "401");
        crearHorario(asigIsi502Act, DiaSemana.JUEVES, LocalTime.of(14, 0), LocalTime.of(16, 0), "402");

        Matricula matriculaHist1 = crearMatricula(estudiante1, periodoAnterior, EstadoMatricula.MATRICULADO,
                "2024II-0001", admin);
        Matricula matriculaHist3 = crearMatricula(estudiante3, periodoAnterior, EstadoMatricula.MATRICULADO,
                "2024II-0002", admin);
        Matricula matriculaHist7 = crearMatricula(estudiante7, periodoAnterior, EstadoMatricula.MATRICULADO,
                "2024II-0003", admin);
        Matricula matriculaAct1 = crearMatricula(estudiante1, periodoActual, EstadoMatricula.MATRICULADO,
                "2025I-0001", admin);
        Matricula matriculaAct3 = crearMatricula(estudiante3, periodoActual, EstadoMatricula.MATRICULADO,
                "2025I-0002", admin);
        Matricula matriculaAct5 = crearMatricula(estudiante5, periodoActual, EstadoMatricula.MATRICULADO,
                "2025I-0003", admin);
        Matricula matriculaAct7 = crearMatricula(estudiante7, periodoActual, EstadoMatricula.MATRICULADO,
                "2025I-0004", admin);
        Matricula matriculaAct8 = crearMatricula(estudiante8, periodoActual, EstadoMatricula.VALIDADA,
                null, admin);
        Matricula matriculaAct2 = crearMatricula(estudiante2, periodoActual, EstadoMatricula.PENDIENTE, null, null);
        // estudiante4 y estudiante6 quedan sin matricula para probar el flujo completo

        DetalleMatricula detHist1Isi101 = crearDetalle(matriculaHist1, asigIsi101);
        DetalleMatricula detHist1Isi102 = crearDetalle(matriculaHist1, asigIsi102);
        DetalleMatricula detHist3Isi101 = crearDetalle(matriculaHist3, asigIsi101);
        DetalleMatricula detHist7Isi101 = crearDetalle(matriculaHist7, asigIsi101);
        DetalleMatricula detHist7Isi102 = crearDetalle(matriculaHist7, asigIsi102);
        DetalleMatricula detAct1Isi301 = crearDetalle(matriculaAct1, asigIsi301);
        crearDetalle(matriculaAct1, asigIsi302);
        crearDetalle(matriculaAct3, asigIsi301);
        crearDetalle(matriculaAct5, asigIsi301);
        crearDetalle(matriculaAct5, asigIsi302);
        crearDetalle(matriculaAct7, asigIsi501Act);
        crearDetalle(matriculaAct7, asigIsi502Act);
        crearDetalle(matriculaAct8, asigIsi301);
        // ocupa el unico cupo de ISI102 (ciclo 1) -> estudiante4 lo vera "sin vacantes"
        crearDetalle(matriculaAct2, asigIsi102Act);

        crearNotaCompleta(detHist1Isi101, "14.0", "15.0", "16.0");
        crearNotaCompleta(detHist1Isi102, "10.0", "09.0", "11.0");
        crearNotaCompleta(detHist3Isi101, "16.0", "17.0", "18.0");
        crearNotaCompleta(detHist7Isi101, "17.0", "16.0", "18.0");
        crearNotaCompleta(detHist7Isi102, "13.0", "14.0", "15.0");
        crearNotaPendiente(detAct1Isi301, "12.0");

        crearSolicitud(estudiante1, TipoDocumento.CERTIFICADO_ESTUDIOS, EstadoSolicitud.PENDIENTE,
                "Tramite de beca", null);
        crearSolicitud(estudiante3, TipoDocumento.CONSTANCIA_MATRICULA, EstadoSolicitud.LISTO,
                "Tramite personal", admin);
        crearSolicitud(estudiante7, TipoDocumento.CONSTANCIA_NOTAS, EstadoSolicitud.EN_PROCESO,
                "Postulacion a practicas", admin);

        crearLog(admin, "auth", "LOGIN", "Inicio de sesion", "EXITO");
        crearLog(admin, "usuarios", "POST /api/admin/usuarios", "Carga inicial de datos", "EXITO");
        crearLog(admin, "periodos", "POST /api/admin/periodos", "Apertura del periodo 2025-I", "EXITO");

        System.out.println("Datos de prueba creados correctamente.");
        System.out.println("Usuarios de prueba (password 123456):");
        System.out.println("  admin@test.com (ADMINISTRADOR) | direccion@test.com (DIRECCION)");
        System.out.println("  docente1-4@test.com (DOCENTE)");
        System.out.println("  estudiante1@test.com (ciclo 3, con historial y matricula)");
        System.out.println("  estudiante2@test.com (ciclo 1, matricula PENDIENTE)");
        System.out.println("  estudiante3@test.com (ciclo 3, matriculado)");
        System.out.println("  estudiante4@test.com (ciclo 1, SIN matricula - probar vacantes)");
        System.out.println("  estudiante5@test.com (ciclo 3, matriculado)");
        System.out.println("  estudiante6@test.com (ciclo 1 ICI, SIN matricula)");
        System.out.println("  estudiante7@test.com (ciclo 5, con historial)");
        System.out.println("  estudiante8@test.com (ciclo 3, matricula VALIDADA - probar pago)");
    }

    private Usuario crearUsuario(String nombres, String apellidos, String email, String codigo, Rol rol) {
        Usuario usuario = new Usuario();
        usuario.setNombres(nombres);
        usuario.setApellidos(apellidos);
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode("123456"));
        usuario.setCodigoUsuario(codigo);
        usuario.setRol(rol);
        usuario.setActivo(true);
        return usuarioRepository.save(usuario);
    }

    private Facultad crearFacultad(String codigo, String nombre) {
        Facultad facultad = new Facultad();
        facultad.setCodigo(codigo);
        facultad.setNombre(nombre);
        return facultadRepository.save(facultad);
    }

    private Especialidad crearEspecialidad(String codigo, String nombre, Facultad facultad) {
        Especialidad especialidad = new Especialidad();
        especialidad.setCodigo(codigo);
        especialidad.setNombre(nombre);
        especialidad.setFacultad(facultad);
        return especialidadRepository.save(especialidad);
    }

    private Docente crearDocente(String nombres, String apellidos, String email, String codigoDocente,
                                  String dni, String gradoAcademico, Facultad facultad) {
        Usuario usuario = crearUsuario(nombres, apellidos, email, codigoDocente, Rol.DOCENTE);
        Docente docente = new Docente();
        docente.setUsuario(usuario);
        docente.setCodigoDocente(codigoDocente);
        docente.setDni(dni);
        docente.setGradoAcademico(gradoAcademico);
        docente.setFacultad(facultad);
        return docenteRepository.save(docente);
    }

    private Estudiante crearEstudiante(String nombres, String apellidos, String email, String codigoEstudiante,
                                        String dni, Especialidad especialidad, int cicloActual, int anioIngreso) {
        Usuario usuario = crearUsuario(nombres, apellidos, email, codigoEstudiante, Rol.ESTUDIANTE);
        Estudiante estudiante = new Estudiante();
        estudiante.setUsuario(usuario);
        estudiante.setCodigoEstudiante(codigoEstudiante);
        estudiante.setDni(dni);
        estudiante.setEspecialidad(especialidad);
        estudiante.setCicloActual(cicloActual);
        estudiante.setAnioIngreso(anioIngreso);
        return estudianteRepository.save(estudiante);
    }

    private Curso crearCurso(String codigo, String nombre, int creditos, int horasSemanales, int ciclo,
                              Especialidad especialidad, Curso prerequisito) {
        Curso curso = new Curso();
        curso.setCodigo(codigo);
        curso.setNombre(nombre);
        curso.setCreditos(creditos);
        curso.setHorasSemanales(horasSemanales);
        curso.setCiclo(ciclo);
        curso.setEspecialidad(especialidad);
        curso.setPrerequisito(prerequisito);
        return cursoRepository.save(curso);
    }

    private PeriodoAcademico crearPeriodo(String codigo, int anio, String semestre, LocalDate inicio,
                                           LocalDate fin, boolean activo, boolean matriculaAbierta) {
        PeriodoAcademico periodo = new PeriodoAcademico();
        periodo.setCodigo(codigo);
        periodo.setAnio(anio);
        periodo.setSemestre(semestre);
        periodo.setFechaInicio(inicio);
        periodo.setFechaFin(fin);
        periodo.setActivo(activo);
        periodo.setMatriculaAbierta(matriculaAbierta);
        return periodoAcademicoRepository.save(periodo);
    }

    private AsignacionDocente crearAsignacion(Curso curso, Docente docente, PeriodoAcademico periodo,
                                              String seccion, int cupos) {
        AsignacionDocente asignacion = new AsignacionDocente();
        asignacion.setCurso(curso);
        asignacion.setDocente(docente);
        asignacion.setPeriodo(periodo);
        asignacion.setSeccion(seccion);
        asignacion.setCupos(cupos);
        return asignacionDocenteRepository.save(asignacion);
    }

    private void crearSolicitud(Estudiante estudiante, TipoDocumento tipo, EstadoSolicitud estado,
                                String motivo, Usuario autorizadaPor) {
        SolicitudDocumento solicitud = new SolicitudDocumento();
        solicitud.setEstudiante(estudiante);
        solicitud.setTipo(tipo);
        solicitud.setEstado(estado);
        solicitud.setMotivo(motivo);
        if (estado != EstadoSolicitud.PENDIENTE && autorizadaPor != null) {
            solicitud.setAutorizadaPor(autorizadaPor);
            solicitud.setFechaAutorizacion(LocalDateTime.now().minusDays(2));
        }
        if (estado == EstadoSolicitud.LISTO && autorizadaPor != null) {
            solicitud.setEmitidaPor(autorizadaPor);
            solicitud.setFechaEmision(LocalDateTime.now().minusDays(1));
            solicitud.setCodigoVerificacion(UUID.randomUUID().toString());
        }
        solicitudDocumentoRepository.save(solicitud);
    }

    private void crearLog(Usuario usuario, String modulo, String accion, String detalle, String resultado) {
        LogAuditoria log = new LogAuditoria();
        log.setUsuario(usuario);
        log.setModulo(modulo);
        log.setAccion(accion);
        log.setDetalle(detalle);
        log.setResultado(resultado);
        log.setIp("127.0.0.1");
        logAuditoriaRepository.save(log);
    }

    private void crearHorario(AsignacionDocente asignacion, DiaSemana dia, LocalTime inicio, LocalTime fin, String aula) {
        Horario horario = new Horario();
        horario.setAsignacion(asignacion);
        horario.setDia(dia);
        horario.setHoraInicio(inicio);
        horario.setHoraFin(fin);
        horario.setAula(aula);
        horarioRepository.save(horario);
    }

    private Matricula crearMatricula(Estudiante estudiante, PeriodoAcademico periodo, EstadoMatricula estado,
                                      String numeroFicha, Usuario validadaPor) {
        Matricula matricula = new Matricula();
        matricula.setEstudiante(estudiante);
        matricula.setPeriodo(periodo);
        matricula.setEstado(estado);
        matricula.setNumeroFicha(numeroFicha);
        matricula.setValidadaPor(validadaPor);
        return matriculaRepository.save(matricula);
    }

    private DetalleMatricula crearDetalle(Matricula matricula, AsignacionDocente asignacion) {
        DetalleMatricula detalle = new DetalleMatricula();
        detalle.setMatricula(matricula);
        detalle.setAsignacion(asignacion);
        return detalleMatriculaRepository.save(detalle);
    }

    private void crearNotaCompleta(DetalleMatricula detalle, String parcial1, String parcial2, String practicas) {
        BigDecimal p1 = new BigDecimal(parcial1);
        BigDecimal p2 = new BigDecimal(parcial2);
        BigDecimal pr = new BigDecimal(practicas);
        BigDecimal promedio = p1.add(p2).add(pr)
                .divide(new BigDecimal("3"), 2, java.math.RoundingMode.HALF_UP);

        Nota nota = new Nota();
        nota.setDetalle(detalle);
        nota.setParcial1(p1);
        nota.setParcial2(p2);
        nota.setPracticas(pr);
        nota.setNotaFinal(promedio);
        nota.setPromedio(promedio);
        nota.setEstado(promedio.compareTo(new BigDecimal("10.5")) >= 0 ? EstadoNota.APROBADO : EstadoNota.DESAPROBADO);
        notaRepository.save(nota);
    }

    private void crearNotaPendiente(DetalleMatricula detalle, String parcial1) {
        Nota nota = new Nota();
        nota.setDetalle(detalle);
        nota.setParcial1(new BigDecimal(parcial1));
        nota.setEstado(EstadoNota.PENDIENTE);
        notaRepository.save(nota);
    }
}
