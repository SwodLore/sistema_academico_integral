package com.universidad.sistema_academico.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AsignacionDocenteRequest {

    @NotNull(message = "El curso es obligatorio")
    private Long cursoId;

    @NotNull(message = "El docente es obligatorio")
    private Long docenteId;

    @NotNull(message = "El anio es obligatorio")
    private Integer anio;

    @NotBlank(message = "El semestre es obligatorio")
    private String semestre;

    @NotBlank(message = "La seccion es obligatoria")
    private String seccion;

    @Valid
    private List<HorarioRequest> horarios;

    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }

    public Long getDocenteId() { return docenteId; }
    public void setDocenteId(Long docenteId) { this.docenteId = docenteId; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }

    public List<HorarioRequest> getHorarios() { return horarios; }
    public void setHorarios(List<HorarioRequest> horarios) { this.horarios = horarios; }
}
