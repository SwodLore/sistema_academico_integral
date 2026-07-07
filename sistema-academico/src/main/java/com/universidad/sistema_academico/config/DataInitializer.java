package com.universidad.sistema_academico.config;

import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

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
        crearEspecialidad("ICI", "Ingenieria Civil", fic);

        Docente docente1 = crearDocente("Juan", "Perez Rojas", "docente1@test.com", "DOC001",
                "12345678", "Magister", fis);
        Docente docente2 = crearDocente("Maria", "Lopez Diaz", "docente2@test.com", "DOC002",
                "23456789", "Magister", fis);

        Estudiante estudiante1 = crearEstudiante("Carlos", "Ramirez Soto", "estudiante1@test.com",
                "EST2024001", "71234567", isi, 3, 2023);
        Estudiante estudiante2 = crearEstudiante("Ana", "Torres Vega", "estudiante2@test.com",
                "EST2024002", "71234568", isi, 1, 2025);
        Estudiante estudiante3 = crearEstudiante("Luis", "Garcia Mendez", "estudiante3@test.com",
                "EST2024003", "71234569", isi, 3, 2023);

        Curso isi101 = crearCurso("ISI101", "Introduccion a la Programacion", 4, 6, 1, isi, null);
        Curso isi102 = crearCurso("ISI102", "Matematica Basica", 4, 5, 1, isi, null);
        Curso isi301 = crearCurso("ISI301", "Estructura de Datos", 4, 6, 3, isi, isi101);
        Curso isi302 = crearCurso("ISI302", "Base de Datos I", 4, 5, 3, isi, null);

        PeriodoAcademico periodoAnterior = crearPeriodo("2024-II", 2024, "II",
                LocalDate.of(2024, 8, 1), LocalDate.of(2024, 12, 15), false, false);
        PeriodoAcademico periodoActual = crearPeriodo("2025-I", 2025, "I",
                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 7, 15), true, true);

        AsignacionDocente asigIsi101 = crearAsignacion(isi101, docente1, periodoAnterior, "A");
        AsignacionDocente asigIsi102 = crearAsignacion(isi102, docente2, periodoAnterior, "A");
        AsignacionDocente asigIsi301 = crearAsignacion(isi301, docente1, periodoActual, "A");
        AsignacionDocente asigIsi302 = crearAsignacion(isi302, docente2, periodoActual, "A");

        crearHorario(asigIsi101, DiaSemana.MIERCOLES, LocalTime.of(8, 0), LocalTime.of(10, 0), "101");
        crearHorario(asigIsi102, DiaSemana.JUEVES, LocalTime.of(8, 0), LocalTime.of(10, 0), "102");
        crearHorario(asigIsi301, DiaSemana.LUNES, LocalTime.of(8, 0), LocalTime.of(10, 0), "201");
        crearHorario(asigIsi302, DiaSemana.MARTES, LocalTime.of(10, 0), LocalTime.of(12, 0), "202");

        Matricula matriculaHist1 = crearMatricula(estudiante1, periodoAnterior, EstadoMatricula.MATRICULADO,
                "2024II-0001", admin);
        Matricula matriculaHist3 = crearMatricula(estudiante3, periodoAnterior, EstadoMatricula.MATRICULADO,
                "2024II-0002", admin);
        Matricula matriculaAct1 = crearMatricula(estudiante1, periodoActual, EstadoMatricula.MATRICULADO,
                "2025I-0001", admin);
        Matricula matriculaAct3 = crearMatricula(estudiante3, periodoActual, EstadoMatricula.MATRICULADO,
                "2025I-0002", admin);
        crearMatricula(estudiante2, periodoActual, EstadoMatricula.PENDIENTE, null, null);

        DetalleMatricula detHist1Isi101 = crearDetalle(matriculaHist1, asigIsi101);
        DetalleMatricula detHist1Isi102 = crearDetalle(matriculaHist1, asigIsi102);
        DetalleMatricula detHist3Isi101 = crearDetalle(matriculaHist3, asigIsi101);
        DetalleMatricula detAct1Isi301 = crearDetalle(matriculaAct1, asigIsi301);
        crearDetalle(matriculaAct1, asigIsi302);
        crearDetalle(matriculaAct3, asigIsi301);

        crearNotaCompleta(detHist1Isi101, "14.0", "15.0", "16.0");
        crearNotaCompleta(detHist1Isi102, "10.0", "09.0", "11.0");
        crearNotaCompleta(detHist3Isi101, "16.0", "17.0", "18.0");
        crearNotaPendiente(detAct1Isi301, "12.0");

        System.out.println("Datos de prueba creados correctamente.");
        System.out.println("Usuarios de prueba:");
        System.out.println("  admin@test.com / 123456 (ADMINISTRADOR)");
        System.out.println("  direccion@test.com / 123456 (DIRECCION)");
        System.out.println("  docente1@test.com / 123456 (DOCENTE)");
        System.out.println("  docente2@test.com / 123456 (DOCENTE)");
        System.out.println("  estudiante1@test.com / 123456 (ESTUDIANTE)");
        System.out.println("  estudiante2@test.com / 123456 (ESTUDIANTE)");
        System.out.println("  estudiante3@test.com / 123456 (ESTUDIANTE)");
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

    private AsignacionDocente crearAsignacion(Curso curso, Docente docente, PeriodoAcademico periodo, String seccion) {
        AsignacionDocente asignacion = new AsignacionDocente();
        asignacion.setCurso(curso);
        asignacion.setDocente(docente);
        asignacion.setPeriodo(periodo);
        asignacion.setSeccion(seccion);
        return asignacionDocenteRepository.save(asignacion);
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
