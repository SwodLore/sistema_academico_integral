package com.universidad.sistema_academico.dto;

import com.universidad.sistema_academico.entity.TipoDocumento;
import jakarta.validation.constraints.NotNull;

public class SolicitudDocumentoRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipo;

    private String motivo;

    public SolicitudDocumentoRequest() {}

    public SolicitudDocumentoRequest(TipoDocumento tipo, String motivo) {
        this.tipo = tipo;
        this.motivo = motivo;
    }

    public TipoDocumento getTipo() { return tipo; }
    public void setTipo(TipoDocumento tipo) { this.tipo = tipo; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
