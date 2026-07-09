package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class HistorialResponse {
    private String estudianteCodigo;
    private String estudianteNombre;
    private String especialidad;
    private Integer cicloActual;

    private int creditosAprobados;
    private int creditosCarrera;   // total de creditos del plan de la especialidad
    private BigDecimal promedioPonderadoAcumulado;

    private int totalCursos;
    private int cursosAprobados;
    private int cursosDesaprobados;

    private List<HistorialSemestreDTO> semestres = new ArrayList<>();  // mas reciente primero

    public HistorialResponse() {}

    public String getEstudianteCodigo() { return estudianteCodigo; }
    public void setEstudianteCodigo(String estudianteCodigo) { this.estudianteCodigo = estudianteCodigo; }

    public String getEstudianteNombre() { return estudianteNombre; }
    public void setEstudianteNombre(String estudianteNombre) { this.estudianteNombre = estudianteNombre; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public Integer getCicloActual() { return cicloActual; }
    public void setCicloActual(Integer cicloActual) { this.cicloActual = cicloActual; }

    public int getCreditosAprobados() { return creditosAprobados; }
    public void setCreditosAprobados(int creditosAprobados) { this.creditosAprobados = creditosAprobados; }

    public int getCreditosCarrera() { return creditosCarrera; }
    public void setCreditosCarrera(int creditosCarrera) { this.creditosCarrera = creditosCarrera; }

    public BigDecimal getPromedioPonderadoAcumulado() { return promedioPonderadoAcumulado; }
    public void setPromedioPonderadoAcumulado(BigDecimal p) { this.promedioPonderadoAcumulado = p; }

    public int getTotalCursos() { return totalCursos; }
    public void setTotalCursos(int totalCursos) { this.totalCursos = totalCursos; }

    public int getCursosAprobados() { return cursosAprobados; }
    public void setCursosAprobados(int cursosAprobados) { this.cursosAprobados = cursosAprobados; }

    public int getCursosDesaprobados() { return cursosDesaprobados; }
    public void setCursosDesaprobados(int cursosDesaprobados) { this.cursosDesaprobados = cursosDesaprobados; }

    public List<HistorialSemestreDTO> getSemestres() { return semestres; }
    public void setSemestres(List<HistorialSemestreDTO> semestres) { this.semestres = semestres; }
}
