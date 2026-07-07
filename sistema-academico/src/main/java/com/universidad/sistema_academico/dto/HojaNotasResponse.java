package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class HojaNotasResponse {
    private boolean tieneMatricula;
    private String matriculaEstado;   // null si aun no hay matricula en el periodo activo
    private String periodo;           // "2026-1"
    private Integer ciclo;

    // Pesos de la formula del promedio (porcentaje)
    private int pesoParcial1;
    private int pesoParcial2;
    private int pesoPracticas;
    private int pesoNotaFinal;

    private BigDecimal promedioPonderado;  // ponderado por creditos de los cursos ya calificados

    private int totalCursos;
    private int aprobados;
    private int desaprobados;
    private int pendientes;
    private int totalCreditos;
    private int creditosAprobados;

    private List<NotaCursoDTO> cursos = new ArrayList<>();

    public HojaNotasResponse() {}

    public boolean isTieneMatricula() { return tieneMatricula; }
    public void setTieneMatricula(boolean tieneMatricula) { this.tieneMatricula = tieneMatricula; }

    public String getMatriculaEstado() { return matriculaEstado; }
    public void setMatriculaEstado(String matriculaEstado) { this.matriculaEstado = matriculaEstado; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Integer getCiclo() { return ciclo; }
    public void setCiclo(Integer ciclo) { this.ciclo = ciclo; }

    public int getPesoParcial1() { return pesoParcial1; }
    public void setPesoParcial1(int pesoParcial1) { this.pesoParcial1 = pesoParcial1; }

    public int getPesoParcial2() { return pesoParcial2; }
    public void setPesoParcial2(int pesoParcial2) { this.pesoParcial2 = pesoParcial2; }

    public int getPesoPracticas() { return pesoPracticas; }
    public void setPesoPracticas(int pesoPracticas) { this.pesoPracticas = pesoPracticas; }

    public int getPesoNotaFinal() { return pesoNotaFinal; }
    public void setPesoNotaFinal(int pesoNotaFinal) { this.pesoNotaFinal = pesoNotaFinal; }

    public BigDecimal getPromedioPonderado() { return promedioPonderado; }
    public void setPromedioPonderado(BigDecimal promedioPonderado) { this.promedioPonderado = promedioPonderado; }

    public int getTotalCursos() { return totalCursos; }
    public void setTotalCursos(int totalCursos) { this.totalCursos = totalCursos; }

    public int getAprobados() { return aprobados; }
    public void setAprobados(int aprobados) { this.aprobados = aprobados; }

    public int getDesaprobados() { return desaprobados; }
    public void setDesaprobados(int desaprobados) { this.desaprobados = desaprobados; }

    public int getPendientes() { return pendientes; }
    public void setPendientes(int pendientes) { this.pendientes = pendientes; }

    public int getTotalCreditos() { return totalCreditos; }
    public void setTotalCreditos(int totalCreditos) { this.totalCreditos = totalCreditos; }

    public int getCreditosAprobados() { return creditosAprobados; }
    public void setCreditosAprobados(int creditosAprobados) { this.creditosAprobados = creditosAprobados; }

    public List<NotaCursoDTO> getCursos() { return cursos; }
    public void setCursos(List<NotaCursoDTO> cursos) { this.cursos = cursos; }
}
