package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;

public class NotaEstudianteDTO {
    private Long detalleId;
    private Long notaId;
    private String codigoEstudiante;
    private String nombreCompleto;
    private BigDecimal parcial1;
    private BigDecimal parcial2;
    private BigDecimal practicas;
    private BigDecimal notaFinal;
    private BigDecimal promedio;
    private String estado;

    public NotaEstudianteDTO() {}

    public NotaEstudianteDTO(Long detalleId, Long notaId, String codigoEstudiante, String nombreCompleto,
                             BigDecimal parcial1, BigDecimal parcial2, BigDecimal practicas,
                             BigDecimal notaFinal, BigDecimal promedio, String estado) {
        this.detalleId = detalleId;
        this.notaId = notaId;
        this.codigoEstudiante = codigoEstudiante;
        this.nombreCompleto = nombreCompleto;
        this.parcial1 = parcial1;
        this.parcial2 = parcial2;
        this.practicas = practicas;
        this.notaFinal = notaFinal;
        this.promedio = promedio;
        this.estado = estado;
    }

    public Long getDetalleId() { return detalleId; }
    public void setDetalleId(Long detalleId) { this.detalleId = detalleId; }

    public Long getNotaId() { return notaId; }
    public void setNotaId(Long notaId) { this.notaId = notaId; }

    public String getCodigoEstudiante() { return codigoEstudiante; }
    public void setCodigoEstudiante(String codigoEstudiante) { this.codigoEstudiante = codigoEstudiante; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

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
}
