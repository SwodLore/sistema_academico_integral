package com.universidad.sistema_academico.dto;

import com.universidad.sistema_academico.entity.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;

public class ProcesarSolicitudDocumentoRequest {

    @NotNull(message = "El estado es obligatorio")
    private EstadoSolicitud estado;

    public ProcesarSolicitudDocumentoRequest() {}

    public ProcesarSolicitudDocumentoRequest(EstadoSolicitud estado) {
        this.estado = estado;
    }

    public EstadoSolicitud getEstado() { return estado; }
    public void setEstado(EstadoSolicitud estado) { this.estado = estado; }
}
