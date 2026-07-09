package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class HistorialSemestreDTO {
    private String periodo;   // "2026-I"
    private Integer anio;
    private String semestre;
    private String matriculaEstado;
    private int creditos;                 // creditos matriculados en el semestre
    private BigDecimal promedioSemestre;  // ponderado por creditos del semestre
    private int aprobados;
    private int desaprobados;
    private int pendientes;
    private List<NotaCursoDTO> cursos = new ArrayList<>();

    public HistorialSemestreDTO() {}

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public String getMatriculaEstado() { return matriculaEstado; }
    public void setMatriculaEstado(String matriculaEstado) { this.matriculaEstado = matriculaEstado; }

    public int getCreditos() { return creditos; }
    public void setCreditos(int creditos) { this.creditos = creditos; }

    public BigDecimal getPromedioSemestre() { return promedioSemestre; }
    public void setPromedioSemestre(BigDecimal promedioSemestre) { this.promedioSemestre = promedioSemestre; }

    public int getAprobados() { return aprobados; }
    public void setAprobados(int aprobados) { this.aprobados = aprobados; }

    public int getDesaprobados() { return desaprobados; }
    public void setDesaprobados(int desaprobados) { this.desaprobados = desaprobados; }

    public int getPendientes() { return pendientes; }
    public void setPendientes(int pendientes) { this.pendientes = pendientes; }

    public List<NotaCursoDTO> getCursos() { return cursos; }
    public void setCursos(List<NotaCursoDTO> cursos) { this.cursos = cursos; }
}
