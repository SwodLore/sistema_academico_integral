package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;

public class ReporteEstudianteDTO {
    private String codigo;
    private String nombre;
    private int creditos;
    private int cursos;
    private int aprobados;
    private int desaprobados;
    private int pendientes;
    private BigDecimal promedio;   // ponderado por creditos del semestre
    private String situacion;      // Aprobado / Desaprobado / En curso / Sin notas

    public ReporteEstudianteDTO() {}

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public int getCreditos() { return creditos; }
    public void setCreditos(int creditos) { this.creditos = creditos; }

    public int getCursos() { return cursos; }
    public void setCursos(int cursos) { this.cursos = cursos; }

    public int getAprobados() { return aprobados; }
    public void setAprobados(int aprobados) { this.aprobados = aprobados; }

    public int getDesaprobados() { return desaprobados; }
    public void setDesaprobados(int desaprobados) { this.desaprobados = desaprobados; }

    public int getPendientes() { return pendientes; }
    public void setPendientes(int pendientes) { this.pendientes = pendientes; }

    public BigDecimal getPromedio() { return promedio; }
    public void setPromedio(BigDecimal promedio) { this.promedio = promedio; }

    public String getSituacion() { return situacion; }
    public void setSituacion(String situacion) { this.situacion = situacion; }
}
