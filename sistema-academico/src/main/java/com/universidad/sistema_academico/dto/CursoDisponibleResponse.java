package com.universidad.sistema_academico.dto;

import java.util.List;

public class CursoDisponibleResponse {

    private Long cursoId;
    private Long asignacionId;
    private String codigo;
    private String nombre;
    private Integer creditos;
    private String docente;
    private String seccion;
    private List<String> horarios;
    private Integer cupos;
    private Integer vacantes;

    public CursoDisponibleResponse(Long cursoId, Long asignacionId, String codigo, String nombre, Integer creditos,
                                   String docente, String seccion, List<String> horarios,
                                   Integer cupos, Integer vacantes) {
        this.cursoId = cursoId;
        this.asignacionId = asignacionId;
        this.codigo = codigo;
        this.nombre = nombre;
        this.creditos = creditos;
        this.docente = docente;
        this.seccion = seccion;
        this.horarios = horarios;
        this.cupos = cupos;
        this.vacantes = vacantes;
    }

    public Long getCursoId() { return cursoId; }
    public Long getAsignacionId() { return asignacionId; }
    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public Integer getCreditos() { return creditos; }
    public String getDocente() { return docente; }
    public String getSeccion() { return seccion; }
    public List<String> getHorarios() { return horarios; }
    public Integer getCupos() { return cupos; }
    public Integer getVacantes() { return vacantes; }
}
