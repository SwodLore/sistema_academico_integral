package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;

public class PuntoEvolucionDTO {
    private String periodo;    // "2026-I"
    private BigDecimal promedio;   // promedio de la cohorte en ese semestre
    private int estudiantes;       // estudiantes de la cohorte que cursaron ese semestre

    public PuntoEvolucionDTO() {}

    public PuntoEvolucionDTO(String periodo, BigDecimal promedio, int estudiantes) {
        this.periodo = periodo;
        this.promedio = promedio;
        this.estudiantes = estudiantes;
    }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public BigDecimal getPromedio() { return promedio; }
    public void setPromedio(BigDecimal promedio) { this.promedio = promedio; }

    public int getEstudiantes() { return estudiantes; }
    public void setEstudiantes(int estudiantes) { this.estudiantes = estudiantes; }
}
