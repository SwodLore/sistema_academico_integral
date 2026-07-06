package com.universidad.sistema_academico.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class RegistrarNotasRequest {

    @NotNull(message = "La lista de notas es obligatoria")
    private List<NotaInput> notas;

    public List<NotaInput> getNotas() { return notas; }
    public void setNotas(List<NotaInput> notas) { this.notas = notas; }

    public static class NotaInput {
        @NotNull(message = "El detalle de matricula es obligatorio")
        private Long detalleId;
        private BigDecimal parcial1;
        private BigDecimal parcial2;
        private BigDecimal practicas;
        private BigDecimal notaFinal;

        public Long getDetalleId() { return detalleId; }
        public void setDetalleId(Long detalleId) { this.detalleId = detalleId; }

        public BigDecimal getParcial1() { return parcial1; }
        public void setParcial1(BigDecimal parcial1) { this.parcial1 = parcial1; }

        public BigDecimal getParcial2() { return parcial2; }
        public void setParcial2(BigDecimal parcial2) { this.parcial2 = parcial2; }

        public BigDecimal getPracticas() { return practicas; }
        public void setPracticas(BigDecimal practicas) { this.practicas = practicas; }

        public BigDecimal getNotaFinal() { return notaFinal; }
        public void setNotaFinal(BigDecimal notaFinal) { this.notaFinal = notaFinal; }
    }
}
