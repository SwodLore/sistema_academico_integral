package com.universidad.sistema_academico.dto;

import java.util.List;

public class DocenteCargaAcademicaResponse {
    private int totalCreditos;
    private int totalHoras;
    private List<CursoAsignadoDTO> cursos;

    public DocenteCargaAcademicaResponse() {}

    public DocenteCargaAcademicaResponse(int totalCreditos, int totalHoras, List<CursoAsignadoDTO> cursos) {
        this.totalCreditos = totalCreditos;
        this.totalHoras = totalHoras;
        this.cursos = cursos;
    }

    public int getTotalCreditos() { return totalCreditos; }
    public void setTotalCreditos(int totalCreditos) { this.totalCreditos = totalCreditos; }

    public int getTotalHoras() { return totalHoras; }
    public void setTotalHoras(int totalHoras) { this.totalHoras = totalHoras; }

    public List<CursoAsignadoDTO> getCursos() { return cursos; }
    public void setCursos(List<CursoAsignadoDTO> cursos) { this.cursos = cursos; }
}
