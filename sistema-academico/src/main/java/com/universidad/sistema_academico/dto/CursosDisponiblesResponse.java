package com.universidad.sistema_academico.dto;

import java.util.List;

public class CursosDisponiblesResponse {

    private Integer ciclo;
    private Integer anio;
    private String semestre;
    private Integer maxCreditos;
    private List<CursoDisponibleResponse> cursos;

    public CursosDisponiblesResponse(Integer ciclo, Integer anio, String semestre,
                                     Integer maxCreditos, List<CursoDisponibleResponse> cursos) {
        this.ciclo = ciclo;
        this.anio = anio;
        this.semestre = semestre;
        this.maxCreditos = maxCreditos;
        this.cursos = cursos;
    }

    public Integer getCiclo() { return ciclo; }
    public Integer getAnio() { return anio; }
    public String getSemestre() { return semestre; }
    public Integer getMaxCreditos() { return maxCreditos; }
    public List<CursoDisponibleResponse> getCursos() { return cursos; }
}
