package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ReporteConsolidadoResponse {
    private Long especialidadId;
    private String especialidad;
    private String periodo;   // "2026-I"
    private Integer anio;
    private String semestre;

    private int totalEstudiantes;
    private BigDecimal promedioGeneral;
    private int aprobados;      // estudiantes con promedio >= 10.5
    private int desaprobados;   // estudiantes con promedio < 10.5
    private int enCurso;        // estudiantes con cursos aun sin nota final

    private List<ReporteEstudianteDTO> estudiantes = new ArrayList<>();

    public ReporteConsolidadoResponse() {}

    public Long getEspecialidadId() { return especialidadId; }
    public void setEspecialidadId(Long especialidadId) { this.especialidadId = especialidadId; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public int getTotalEstudiantes() { return totalEstudiantes; }
    public void setTotalEstudiantes(int totalEstudiantes) { this.totalEstudiantes = totalEstudiantes; }

    public BigDecimal getPromedioGeneral() { return promedioGeneral; }
    public void setPromedioGeneral(BigDecimal promedioGeneral) { this.promedioGeneral = promedioGeneral; }

    public int getAprobados() { return aprobados; }
    public void setAprobados(int aprobados) { this.aprobados = aprobados; }

    public int getDesaprobados() { return desaprobados; }
    public void setDesaprobados(int desaprobados) { this.desaprobados = desaprobados; }

    public int getEnCurso() { return enCurso; }
    public void setEnCurso(int enCurso) { this.enCurso = enCurso; }

    public List<ReporteEstudianteDTO> getEstudiantes() { return estudiantes; }
    public void setEstudiantes(List<ReporteEstudianteDTO> estudiantes) { this.estudiantes = estudiantes; }
}
