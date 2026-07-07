package com.universidad.sistema_academico.dto;

import jakarta.validation.constraints.NotBlank;

public class SilaboRequest {

    @NotBlank(message = "Las competencias son obligatorias")
    private String competencias;

    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    @NotBlank(message = "La bibliografía es obligatoria")
    private String bibliografia;

    public SilaboRequest() {}

    public SilaboRequest(String competencias, String contenido, String bibliografia) {
        this.competencias = competencias;
        this.contenido = contenido;
        this.bibliografia = bibliografia;
    }

    public String getCompetencias() { return competencias; }
    public void setCompetencias(String competencias) { this.competencias = competencias; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public String getBibliografia() { return bibliografia; }
    public void setBibliografia(String bibliografia) { this.bibliografia = bibliografia; }
}
