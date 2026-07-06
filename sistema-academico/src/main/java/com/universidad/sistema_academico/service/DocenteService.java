package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.CursoAsignadoDTO;
import com.universidad.sistema_academico.dto.DocenteCargaAcademicaResponse;
import com.universidad.sistema_academico.dto.HorarioDTO;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocenteService {

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @Autowired
    private AsignacionDocenteRepository asignacionRepository;

    @Autowired
    private HorarioRepository horarioRepository;

    public DocenteCargaAcademicaResponse getCargaAcademica(Usuario usuario, Integer anio, String semestre) {
        Docente docente = docenteRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("No se encontro el perfil de docente para este usuario"));

        PeriodoAcademico periodo;
        if (anio != null && semestre != null && !semestre.trim().isEmpty()) {
            periodo = periodoRepository.findByAnioAndSemestre(anio, semestre)
                    .orElseThrow(() -> new RuntimeException("El periodo academico especificado no existe"));
        } else {
            periodo = periodoRepository.findByActivoTrue()
                    .orElse(null);
        }

        if (periodo == null) {
            return new DocenteCargaAcademicaResponse(0, 0, new ArrayList<>());
        }

        List<AsignacionDocente> asignaciones = asignacionRepository.findByDocenteIdAndPeriodoId(docente.getId(), periodo.getId());

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

            cursosDTO.add(new CursoAsignadoDTO(
                    asignacion.getId(),
                    curso.getId(),
                    curso.getCodigo(),
                    curso.getNombre(),
                    asignacion.getSeccion(),
                    curso.getCreditos(),
                    curso.getHorasSemanales(),
                    horariosDTO
            ));
        }

        return new DocenteCargaAcademicaResponse(totalCreditos, totalHoras, cursosDTO);
    }
}
