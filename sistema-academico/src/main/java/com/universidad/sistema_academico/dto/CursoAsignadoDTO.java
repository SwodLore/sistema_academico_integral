package com.universidad.sistema_academico.dto;

import java.util.List;

public class CursoAsignadoDTO {
    private Long cursoId;
    private String codigo;
    private String nombre;
    private String seccion;
    private int creditos;
    private int horasSemanales;
    private List<HorarioDTO> horarios;

    public CursoAsignadoDTO() {}

    public CursoAsignadoDTO(Long cursoId, String codigo, String nombre, String seccion, int creditos, int horasSemanales, List<HorarioDTO> horarios) {
        this.cursoId = cursoId;
        this.codigo = codigo;
        this.nombre = nombre;
        this.seccion = seccion;
        this.creditos = creditos;
        this.horasSemanales = horasSemanales;
        this.horarios = horarios;
    }

    public Long getCursoId() { return cursoId; }
    public void setCursoId(Long cursoId) { this.cursoId = cursoId; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }

    public int getCreditos() { return creditos; }
    public void setCreditos(int creditos) { this.creditos = creditos; }

    public int getHorasSemanales() { return horasSemanales; }
    public void setHorasSemanales(int horasSemanales) { this.horasSemanales = horasSemanales; }

    public List<HorarioDTO> getHorarios() { return horarios; }
    public void setHorarios(List<HorarioDTO> horarios) { this.horarios = horarios; }
}
