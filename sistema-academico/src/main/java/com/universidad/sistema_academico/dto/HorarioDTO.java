package com.universidad.sistema_academico.dto;

public class HorarioDTO {
    private String dia;
    private String horaInicio;
    private String horaFin;
    private String aula;

    public HorarioDTO() {}

    public HorarioDTO(String dia, String horaInicio, String horaFin, String aula) {
        this.dia = dia;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.aula = aula;
    }

    public String getDia() { return dia; }
    public void setDia(String dia) { this.dia = dia; }

    public String getHoraInicio() { return horaInicio; }
    public void setHoraInicio(String horaInicio) { this.horaInicio = horaInicio; }

    public String getHoraFin() { return horaFin; }
    public void setHoraFin(String horaFin) { this.horaFin = horaFin; }

    public String getAula() { return aula; }
    public void setAula(String aula) { this.aula = aula; }
}
