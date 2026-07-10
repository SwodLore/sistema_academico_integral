package com.universidad.sistema_academico.dto;

import com.universidad.sistema_academico.entity.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;

public class ProcesarSolicitudDocumentoRequest {

    @NotNull(message = "El estado es obligatorio")
    private EstadoSolicitud estado;

    private String motivoRechazo;

    public ProcesarSolicitudDocumentoRequest() {}

    public ProcesarSolicitudDocumentoRequest(EstadoSolicitud estado) {
        this.estado = estado;
    }

    public ProcesarSolicitudDocumentoRequest(EstadoSolicitud estado, String motivoRechazo) {
        this.estado = estado;
        this.motivoRechazo = motivoRechazo;
    }

    public EstadoSolicitud getEstado() { return estado; }
    public void setEstado(EstadoSolicitud estado) { this.estado = estado; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }
}
