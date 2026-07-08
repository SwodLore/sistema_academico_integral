package com.universidad.sistema_academico.dto;

import com.universidad.sistema_academico.entity.Curso;
import com.universidad.sistema_academico.entity.Docente;
import com.universidad.sistema_academico.entity.PeriodoAcademico;
import java.util.List;

public class AsignacionDocenteResponseDTO {
    private Long id;
    private Curso curso;
    private Docente docente;
    private PeriodoAcademico periodo;
    private String seccion;
    private List<HorarioDTO> horarios;

    public AsignacionDocenteResponseDTO() {}

    public AsignacionDocenteResponseDTO(Long id, Curso curso, Docente docente, PeriodoAcademico periodo, String seccion, List<HorarioDTO> horarios) {
        this.id = id;
        this.curso = curso;
        this.docente = docente;
        this.periodo = periodo;
        this.seccion = seccion;
        this.horarios = horarios;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Curso getCurso() { return curso; }
    public void setCurso(Curso curso) { this.curso = curso; }

    public Docente getDocente() { return docente; }
    public void setDocente(Docente docente) { this.docente = docente; }

    public PeriodoAcademico getPeriodo() { return periodo; }
    public void setPeriodo(PeriodoAcademico periodo) { this.periodo = periodo; }

    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }

    public List<HorarioDTO> getHorarios() { return horarios; }
    public void setHorarios(List<HorarioDTO> horarios) { this.horarios = horarios; }
}
