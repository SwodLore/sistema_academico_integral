package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class IndicadoresResponse {
    private String periodo;      // "2026-I"
    private Integer anio;
    private String semestre;

    private int totalEstudiantes;
    private int totalCalificados;   // cursos con nota final calculada
    private BigDecimal promedioGeneral;
    private int aprobados;
    private int desaprobados;
    private int pendientes;
    private BigDecimal tasaAprobacion;      // sobre cursos ya evaluados (aprobados + desaprobados)
    private BigDecimal tasaDesaprobacion;

    private List<IndicadorEspecialidadDTO> especialidades = new ArrayList<>();

    public IndicadoresResponse() {}

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public int getTotalEstudiantes() { return totalEstudiantes; }
    public void setTotalEstudiantes(int totalEstudiantes) { this.totalEstudiantes = totalEstudiantes; }

    public int getTotalCalificados() { return totalCalificados; }
    public void setTotalCalificados(int totalCalificados) { this.totalCalificados = totalCalificados; }

    public BigDecimal getPromedioGeneral() { return promedioGeneral; }
    public void setPromedioGeneral(BigDecimal promedioGeneral) { this.promedioGeneral = promedioGeneral; }

    public int getAprobados() { return aprobados; }
    public void setAprobados(int aprobados) { this.aprobados = aprobados; }

    public int getDesaprobados() { return desaprobados; }
    public void setDesaprobados(int desaprobados) { this.desaprobados = desaprobados; }

    public int getPendientes() { return pendientes; }
    public void setPendientes(int pendientes) { this.pendientes = pendientes; }

    public BigDecimal getTasaAprobacion() { return tasaAprobacion; }
    public void setTasaAprobacion(BigDecimal tasaAprobacion) { this.tasaAprobacion = tasaAprobacion; }

    public BigDecimal getTasaDesaprobacion() { return tasaDesaprobacion; }
    public void setTasaDesaprobacion(BigDecimal tasaDesaprobacion) { this.tasaDesaprobacion = tasaDesaprobacion; }

    public List<IndicadorEspecialidadDTO> getEspecialidades() { return especialidades; }
    public void setEspecialidades(List<IndicadorEspecialidadDTO> especialidades) { this.especialidades = especialidades; }
}
