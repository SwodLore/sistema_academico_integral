package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;

public class IndicadorEspecialidadDTO {
    private Long especialidadId;
    private String especialidad;
    private int estudiantes;
    private int cursosCalificados;
    private BigDecimal promedio;
    private int aprobados;
    private int desaprobados;
    private int pendientes;
    private BigDecimal tasaAprobacion;
    private BigDecimal tasaDesaprobacion;

    public IndicadorEspecialidadDTO() {}

    public Long getEspecialidadId() { return especialidadId; }
    public void setEspecialidadId(Long especialidadId) { this.especialidadId = especialidadId; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public int getEstudiantes() { return estudiantes; }
    public void setEstudiantes(int estudiantes) { this.estudiantes = estudiantes; }

    public int getCursosCalificados() { return cursosCalificados; }
    public void setCursosCalificados(int cursosCalificados) { this.cursosCalificados = cursosCalificados; }

    public BigDecimal getPromedio() { return promedio; }
    public void setPromedio(BigDecimal promedio) { this.promedio = promedio; }

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
}
