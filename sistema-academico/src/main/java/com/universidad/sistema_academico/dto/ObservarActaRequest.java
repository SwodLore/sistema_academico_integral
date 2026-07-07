package com.universidad.sistema_academico.dto;

import jakarta.validation.constraints.NotBlank;

public class ObservarActaRequest {

    @NotBlank(message = "Debes indicar el motivo de la observacion")
    private String observacion;

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
