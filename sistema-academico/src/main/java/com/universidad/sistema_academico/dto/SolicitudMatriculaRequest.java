package com.universidad.sistema_academico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class SolicitudMatriculaRequest {

    @NotNull(message = "El ciclo es obligatorio")
    private Integer ciclo;

    @NotNull(message = "El anio es obligatorio")
    private Integer anio;

    @NotBlank(message = "El semestre es obligatorio")
    private String semestre;

    @NotEmpty(message = "Debes seleccionar al menos un curso")
    private List<Long> cursosIds;

    public Integer getCiclo() { return ciclo; }
    public void setCiclo(Integer ciclo) { this.ciclo = ciclo; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public List<Long> getCursosIds() { return cursosIds; }
    public void setCursosIds(List<Long> cursosIds) { this.cursosIds = cursosIds; }
}
