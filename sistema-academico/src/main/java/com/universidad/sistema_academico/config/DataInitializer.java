package com.universidad.sistema_academico.config;

import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import com.universidad.sistema_academico.service.CertificadoPdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
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
    private PagoRepository pagoRepository;
    @Autowired
    private LogAuditoriaRepository logAuditoriaRepository;
    @Autowired
    private CertificadoPdfService certificadoPdfService;

    @Value("${app.upload.dir}")
    private String uploadDir;
    @Value("${app.base-url}")
    private String baseUrl;

    private static final Map<TipoDocumento, String> ETIQUETA_DOCUMENTO = Map.of(
            TipoDocumento.CERTIFICADO_ESTUDIOS, "Certificado de Estudios",
            TipoDocumento.CONSTANCIA_MATRICULA, "Constancia de Matrícula",
            TipoDocumento.CONSTANCIA_NOTAS, "Constancia de Notas",
            TipoDocumento.CONSTANCIA_EGRESADO, "Constancia de Egresado",
            TipoDocumento.CONSTANCIA_TERCIO_SUPERIOR, "Constancia de Tercio Superior"
    );

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

        // Cursos adicionales de ciclos 2 y 4 para completar trayectorias academicas
        Curso isi201 = crearCurso("ISI201", "Programacion Orientada a Objetos", 4, 6, 2, isi, isi101);
        Curso isi202 = crearCurso("ISI202", "Matematica Discreta", 3, 5, 2, isi, isi102);
        Curso isi401 = crearCurso("ISI401", "Sistemas Operativos", 4, 6, 4, isi, isi301);
        Curso isi402 = crearCurso("ISI402", "Analisis y Diseno de Sistemas", 4, 5, 4, isi, isi302);
        Curso ici201 = crearCurso("ICI201", "Estatica", 4, 6, 2, ici, ici102);
        Curso ici202 = crearCurso("ICI202", "Topografia", 3, 5, 2, ici, null);
        Curso ici301 = crearCurso("ICI301", "Resistencia de Materiales", 4, 6, 3, ici, ici201);
        Curso ici302 = crearCurso("ICI302", "Hidraulica", 4, 6, 3, ici, null);
        Curso ici401 = crearCurso("ICI401", "Concreto Armado", 4, 6, 4, ici, ici301);

        PeriodoAcademico periodoAnterior = crearPeriodo("2024-II", 2024, "II",
                LocalDate.of(2024, 8, 1), LocalDate.of(2024, 12, 15), false, false);
        PeriodoAcademico periodoActual = crearPeriodo("2025-I", 2025, "I",
                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 7, 15), true, true);

        // Periodos historicos para dar profundidad a la evolucion por cohorte
        PeriodoAcademico p2023I = crearPeriodo("2023-I", 2023, "I",
                LocalDate.of(2023, 3, 1), LocalDate.of(2023, 7, 15), false, false);
        PeriodoAcademico p2023II = crearPeriodo("2023-II", 2023, "II",
                LocalDate.of(2023, 8, 1), LocalDate.of(2023, 12, 15), false, false);
        PeriodoAcademico p2024I = crearPeriodo("2024-I", 2024, "I",
                LocalDate.of(2024, 3, 1), LocalDate.of(2024, 7, 15), false, false);

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
        Matricula matriculaAct8 = crearMatricula(estudiante8, periodoActual, EstadoMatricula.PAGADA,
                null, null);
        crearPago(matriculaAct8, estudiante8.getUsuario(), "350.00", "REC-2025-0008");
        Matricula matriculaAct2 = crearMatricula(estudiante2, periodoActual, EstadoMatricula.PENDIENTE, null, null);
        // estudiante4 y estudiante6 quedan sin matricula para probar el flujo completo

        DetalleMatricula detHist1Isi101 = crearDetalle(matriculaHist1, asigIsi101);
        DetalleMatricula detHist1Isi102 = crearDetalle(matriculaHist1, asigIsi102);
        DetalleMatricula detHist3Isi101 = crearDetalle(matriculaHist3, asigIsi101);
        DetalleMatricula detHist7Isi101 = crearDetalle(matriculaHist7, asigIsi101);
        DetalleMatricula detHist7Isi102 = crearDetalle(matriculaHist7, asigIsi102);
        DetalleMatricula detAct1Isi301 = crearDetalle(matriculaAct1, asigIsi301);
        crearNotaCompleta(crearDetalle(matriculaAct1, asigIsi302), "15.0", "14.0", "16.0");
        crearNotaCompleta(crearDetalle(matriculaAct3, asigIsi301), "13.0", "14.0", "15.0");
        crearNotaCompleta(crearDetalle(matriculaAct5, asigIsi301), "11.0", "10.0", "12.0");
        crearNotaCompleta(crearDetalle(matriculaAct5, asigIsi302), "16.0", "15.0", "17.0");
        crearNotaCompleta(crearDetalle(matriculaAct7, asigIsi501Act), "17.0", "18.0", "16.0");
        crearNotaCompleta(crearDetalle(matriculaAct7, asigIsi502Act), "12.0", "09.0", "10.0");
        crearNotaCompleta(crearDetalle(matriculaAct8, asigIsi301), "14.0", "13.0", "15.0");
        // ocupa el unico cupo de ISI102 (ciclo 1) -> estudiante4 lo vera "sin vacantes"
        crearDetalle(matriculaAct2, asigIsi102Act);

        crearNotaCompleta(detHist1Isi101, "14.0", "15.0", "16.0");
        crearNotaCompleta(detHist1Isi102, "10.0", "09.0", "11.0");
        crearNotaCompleta(detHist3Isi101, "16.0", "17.0", "18.0");
        crearNotaCompleta(detHist7Isi101, "17.0", "16.0", "18.0");
        crearNotaCompleta(detHist7Isi102, "13.0", "14.0", "15.0");
        crearNotaPendiente(detAct1Isi301, "12.0");

        // Solicitudes en distintos estados
        crearSolicitud(estudiante1, TipoDocumento.CERTIFICADO_ESTUDIOS, EstadoSolicitud.PENDIENTE,
                "Tramite de beca", null);
        crearSolicitud(estudiante7, TipoDocumento.CONSTANCIA_NOTAS, EstadoSolicitud.EN_PROCESO,
                "Postulacion a practicas", admin);

        // Un documento EMITIDO de cada tipo, con su PDF real generado (cada uno con contenido distinto)
        crearSolicitud(estudiante3, TipoDocumento.CONSTANCIA_MATRICULA, EstadoSolicitud.LISTO,
                "Tramite personal", admin);
        crearSolicitud(estudiante2, TipoDocumento.CERTIFICADO_ESTUDIOS, EstadoSolicitud.LISTO,
                "Tramite de bachiller", admin);
        crearSolicitud(estudiante4, TipoDocumento.CONSTANCIA_NOTAS, EstadoSolicitud.LISTO,
                "Postulacion laboral", admin);
        crearSolicitud(estudiante5, TipoDocumento.CONSTANCIA_EGRESADO, EstadoSolicitud.LISTO,
                "Tramite de titulo", admin);
        crearSolicitud(estudiante6, TipoDocumento.CONSTANCIA_TERCIO_SUPERIOR, EstadoSolicitud.LISTO,
                "Postulacion a beca de posgrado", admin);

        crearLog(admin, "auth", "LOGIN", "Inicio de sesion", "EXITO");
        crearLog(admin, "usuarios", "POST /api/admin/usuarios", "Carga inicial de datos", "EXITO");
        crearLog(admin, "periodos", "POST /api/admin/periodos", "Apertura del periodo 2025-I", "EXITO");

        // ==== Cohortes con historial multi-periodo (alimenta indicadores, reportes y cohortes) ====
        java.util.Random rnd = new java.util.Random(2025);
        List<Docente> docsIsi = List.of(docente1, docente2, docente4);
        List<Docente> docsIci = List.of(docente3);

        // ISI - cohorte 2023: trayectoria completa (ciclos 1 a 5), todos activos en 2025-I
        sembrarCohorte(isi, 2023, 5, 4, List.of(
                new Etapa(p2023I, List.of(isi101, isi102)),
                new Etapa(p2023II, List.of(isi201, isi202)),
                new Etapa(p2024I, List.of(isi301, isi302)),
                new Etapa(periodoAnterior, List.of(isi401, isi402)),
                new Etapa(periodoActual, List.of(isi501, isi502))
        ), 0, admin, docsIsi, rnd);

        // ISI - cohorte 2024: ciclos 1 a 3, uno abandona (inactivo)
        sembrarCohorte(isi, 2024, 3, 4, List.of(
                new Etapa(p2024I, List.of(isi101, isi102)),
                new Etapa(periodoAnterior, List.of(isi201, isi202)),
                new Etapa(periodoActual, List.of(isi301, isi302))
        ), 1, admin, docsIsi, rnd);

        // ICI - cohorte 2023: ciclos 1 a 4, uno abandona (inactivo)
        sembrarCohorte(ici, 2023, 4, 3, List.of(
                new Etapa(p2023I, List.of(ici101, ici102)),
                new Etapa(p2023II, List.of(ici201, ici202)),
                new Etapa(p2024I, List.of(ici301, ici302)),
                new Etapa(periodoActual, List.of(ici401))
        ), 1, admin, docsIci, rnd);

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
        System.out.println("  estudiante8@test.com (ciclo 3, pago enviado - probar validacion del admin)");
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
            emitirPdf(solicitud);
        }
        solicitudDocumentoRepository.save(solicitud);
    }

    /** Genera el PDF real del documento emitido (mismo flujo que el controller) y lo enlaza a la solicitud */
    private void emitirPdf(SolicitudDocumento solicitud) {
        try {
            Path dirPath = Paths.get(uploadDir, "certificados");
            Files.createDirectories(dirPath);
            String filename = "constancia_seed_" + solicitud.getTipo() + "_"
                    + System.currentTimeMillis() + ".pdf";
            Path filePath = dirPath.resolve(filename);

            String label = ETIQUETA_DOCUMENTO.getOrDefault(solicitud.getTipo(), "Constancia Académica");
            String urlVerificacion = baseUrl + "/api/solicitudes-documento/verificar/"
                    + solicitud.getCodigoVerificacion();

            byte[] pdfBytes = certificadoPdfService.generar(solicitud, label, urlVerificacion);
            Files.write(filePath, pdfBytes);
            solicitud.setDocumentoUrl("/uploads/certificados/" + filename);
        } catch (Exception e) {
            System.err.println("No se pudo generar el PDF de la solicitud sembrada: " + e.getMessage());
        }
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

    private void crearPago(Matricula matricula, Usuario registradoPor, String monto, String numeroRecibo) {
        Pago pago = new Pago();
        pago.setMatricula(matricula);
        pago.setMonto(new BigDecimal(monto));
        pago.setNumeroRecibo(numeroRecibo);
        pago.setMetodoPago("TRANSFERENCIA");
        pago.setRegistradoPor(registradoPor);
        pagoRepository.save(pago);
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

    // ==== Apoyo para sembrar cohortes con historial multi-periodo ====

    // Reutiliza una unica asignacion (seccion "B") por curso+periodo para no violar la
    // restriccion unica (curso, periodo, seccion) ni chocar con las asignaciones "A" ya creadas.
    private final Map<String, AsignacionDocente> asigCache = new HashMap<>();
    private int estSeq = 100;
    private int fichaSeq = 1;

    private static final String[] NOMBRES = {
            "Andrea", "Bruno", "Camila", "David", "Erika", "Fabio", "Gabriela", "Hugo",
            "Irene", "Jorge", "Karla", "Milagros", "Nestor", "Olga", "Paolo", "Rocio"
    };
    private static final String[] APELLIDOS = {
            "Aguirre Leon", "Bautista Rojas", "Cardenas Silva", "Delgado Nunez",
            "Espinoza Vera", "Fernandez Cruz", "Gonzales Paz", "Herrera Lima",
            "Ibarra Sosa", "Jimenez Ruiz", "Mendoza Rios", "Navarro Diaz",
            "Ochoa Prado", "Ponce Vidal", "Ramos Salas", "Sanchez Melo"
    };

    /** Etapa de una trayectoria: en un periodo el estudiante lleva un conjunto de cursos. */
    private static class Etapa {
        final PeriodoAcademico periodo;
        final List<Curso> cursos;

        Etapa(PeriodoAcademico periodo, List<Curso> cursos) {
            this.periodo = periodo;
            this.cursos = cursos;
        }
    }

    /**
     * Crea {@code cantidad} estudiantes de una cohorte (misma especialidad y año de ingreso)
     * y los hace avanzar por la trayectoria dada, calificando cada curso. Los primeros
     * {@code inactivos} estudiantes no llegan al ultimo periodo (para bajar la retencion).
     */
    private void sembrarCohorte(Especialidad esp, int anioIngreso, int cicloActual, int cantidad,
                                List<Etapa> trayectoria, int inactivos, Usuario admin,
                                List<Docente> docentes, Random rnd) {
        for (int s = 0; s < cantidad; s++) {
            Estudiante est = nuevoEstudianteAuto(esp, cicloActual, anioIngreso);
            int etapas = (s < inactivos) ? Math.max(1, trayectoria.size() - 1) : trayectoria.size();
            for (int e = 0; e < etapas; e++) {
                Etapa etapa = trayectoria.get(e);
                matricularConNotas(est, etapa.periodo, admin, rnd, etapa.cursos, docentes);
            }
        }
    }

    private Estudiante nuevoEstudianteAuto(Especialidad esp, int ciclo, int anioIngreso) {
        int n = estSeq++;
        String nombres = NOMBRES[n % NOMBRES.length];
        String apellidos = APELLIDOS[(n + 3) % APELLIDOS.length];
        String codigo = "EST" + anioIngreso + String.format("%03d", n);
        String dni = String.valueOf(70000000 + n);
        String email = "est" + n + "@test.com";
        return crearEstudiante(nombres, apellidos, email, codigo, dni, esp, ciclo, anioIngreso);
    }

    private void matricularConNotas(Estudiante est, PeriodoAcademico periodo, Usuario admin,
                                    Random rnd, List<Curso> cursos, List<Docente> docentes) {
        Matricula m = crearMatricula(est, periodo, EstadoMatricula.MATRICULADO, siguienteFicha(periodo), admin);
        int i = 0;
        for (Curso c : cursos) {
            Docente d = docentes.get(i % docentes.size());
            crearNotaAleatoria(crearDetalle(m, asignacionDe(c, periodo, d)), rnd);
            i++;
        }
    }

    private AsignacionDocente asignacionDe(Curso curso, PeriodoAcademico periodo, Docente docente) {
        String key = curso.getId() + "-" + periodo.getId();
        return asigCache.computeIfAbsent(key, k -> crearAsignacion(curso, docente, periodo, "B", 40));
    }

    private String siguienteFicha(PeriodoAcademico periodo) {
        return periodo.getCodigo() + "-G" + String.format("%03d", fichaSeq++);
    }

    // Genera tres notas cercanas a una base para que haya mezcla realista de aprobados/desaprobados.
    private void crearNotaAleatoria(DetalleMatricula detalle, Random rnd) {
        int base = 8 + rnd.nextInt(10); // 8..17
        crearNotaCompleta(detalle,
                acotar(base + rnd.nextInt(5) - 2) + ".0",
                acotar(base + rnd.nextInt(5) - 2) + ".0",
                acotar(base + rnd.nextInt(5) - 2) + ".0");
    }

    private String acotar(int n) {
        return String.valueOf(Math.max(2, Math.min(20, n)));
    }
}
