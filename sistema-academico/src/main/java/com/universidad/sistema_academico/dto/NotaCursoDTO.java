package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;

public class NotaCursoDTO {
    private Long asignacionId;
    private String cursoCodigo;
    private String cursoNombre;
    private Integer creditos;
    private String seccion;
    private String docente;
    private BigDecimal parcial1;
    private BigDecimal parcial2;
    private BigDecimal practicas;
    private BigDecimal notaFinal;
    private BigDecimal promedio;
    private String estado;      // PENDIENTE / APROBADO / DESAPROBADO
    private String estadoActa;  // ABIERTA / CERRADA / VALIDADA

    public NotaCursoDTO() {}

    public NotaCursoDTO(Long asignacionId, String cursoCodigo, String cursoNombre, Integer creditos, String seccion, String docente,
                        BigDecimal parcial1, BigDecimal parcial2, BigDecimal practicas, BigDecimal notaFinal,
                        BigDecimal promedio, String estado, String estadoActa) {
        this.asignacionId = asignacionId;
        this.cursoCodigo = cursoCodigo;
        this.cursoNombre = cursoNombre;
        this.creditos = creditos;
        this.seccion = seccion;
        this.docente = docente;
        this.parcial1 = parcial1;
        this.parcial2 = parcial2;
        this.practicas = practicas;
        this.notaFinal = notaFinal;
        this.promedio = promedio;
        this.estado = estado;
        this.estadoActa = estadoActa;
    }

    public Long getAsignacionId() { return asignacionId; }
    public void setAsignacionId(Long asignacionId) { this.asignacionId = asignacionId; }

    public String getCursoCodigo() { return cursoCodigo; }
    public void setCursoCodigo(String cursoCodigo) { this.cursoCodigo = cursoCodigo; }

    public String getCursoNombre() { return cursoNombre; }
    public void setCursoNombre(String cursoNombre) { this.cursoNombre = cursoNombre; }

    public Integer getCreditos() { return creditos; }
    public void setCreditos(Integer creditos) { this.creditos = creditos; }

    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }

    public String getDocente() { return docente; }
    public void setDocente(String docente) { this.docente = docente; }

    public BigDecimal getParcial1() { return parcial1; }
    public void setParcial1(BigDecimal parcial1) { this.parcial1 = parcial1; }

    public BigDecimal getParcial2() { return parcial2; }
    public void setParcial2(BigDecimal parcial2) { this.parcial2 = parcial2; }

    public BigDecimal getPracticas() { return practicas; }
    public void setPracticas(BigDecimal practicas) { this.practicas = practicas; }

    public BigDecimal getNotaFinal() { return notaFinal; }
    public void setNotaFinal(BigDecimal notaFinal) { this.notaFinal = notaFinal; }

    public BigDecimal getPromedio() { return promedio; }
    public void setPromedio(BigDecimal promedio) { this.promedio = promedio; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getEstadoActa() { return estadoActa; }
    public void setEstadoActa(String estadoActa) { this.estadoActa = estadoActa; }
}
