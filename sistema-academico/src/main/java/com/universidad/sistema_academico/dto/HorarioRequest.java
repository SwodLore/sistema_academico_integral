package com.universidad.sistema_academico.dto;

import jakarta.validation.constraints.NotBlank;

public class HorarioRequest {

    @NotBlank(message = "El dia de la semana es obligatorio")
    private String dia; // LUNES, MARTES, etc.

    @NotBlank(message = "La hora de inicio es obligatoria")
    private String horaInicio; // "HH:mm"

    @NotBlank(message = "La hora de fin es obligatoria")
    private String horaFin; // "HH:mm"

    private String aula;

    public String getDia() { return dia; }
    public void setDia(String dia) { this.dia = dia; }

    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }

    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }

    public String getAula() { return aula; }
    public void setAula(String aula) { this.aula = aula; }
}
