package com.universidad.sistema_academico.dto;

import jakarta.validation.constraints.NotNull;

public class ValidarMatriculaRequest {

    @NotNull(message = "Debes indicar si la solicitud se aprueba o rechaza")
    private Boolean aprobado;

    private String observacion;

    public Boolean getAprobado() { return aprobado; }
    public void setAprobado(Boolean aprobado) { this.aprobado = aprobado; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
