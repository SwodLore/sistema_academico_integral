package com.universidad.sistema_academico.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class PeriodoRequest {

    @NotNull(message = "El año es obligatorio")
    @Min(value = 2000, message = "Año inválido")
    private Integer anio;

    @NotBlank(message = "El semestre es obligatorio")
    private String semestre;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
}
