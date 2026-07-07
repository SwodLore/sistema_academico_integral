package com.universidad.sistema_academico.dto;

public class ActaResumenDTO {
    private Long actaId;
    private Long asignacionId;
    private String cursoCodigo;
    private String cursoNombre;
    private String seccion;
    private String periodo;
    private String docente;
    private String especialidad;
    private String estadoActa;
    private int totalEstudiantes;
    private int aprobados;
    private int desaprobados;
    private int pendientes;
    private String observacion;

    public ActaResumenDTO() {}

    public Long getActaId() { return actaId; }
    public void setActaId(Long actaId) { this.actaId = actaId; }

    public Long getAsignacionId() { return asignacionId; }
    public void setAsignacionId(Long asignacionId) { this.asignacionId = asignacionId; }

    public String getCursoCodigo() { return cursoCodigo; }
    public void setCursoCodigo(String cursoCodigo) { this.cursoCodigo = cursoCodigo; }

    public String getCursoNombre() { return cursoNombre; }
    public void setCursoNombre(String cursoNombre) { this.cursoNombre = cursoNombre; }

    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public String getDocente() { return docente; }
    public void setDocente(String docente) { this.docente = docente; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public String getEstadoActa() { return estadoActa; }
    public void setEstadoActa(String estadoActa) { this.estadoActa = estadoActa; }

    public int getTotalEstudiantes() { return totalEstudiantes; }
    public void setTotalEstudiantes(int totalEstudiantes) { this.totalEstudiantes = totalEstudiantes; }

    public int getAprobados() { return aprobados; }
    public void setAprobados(int aprobados) { this.aprobados = aprobados; }

    public int getDesaprobados() { return desaprobados; }
    public void setDesaprobados(int desaprobados) { this.desaprobados = desaprobados; }

    public int getPendientes() { return pendientes; }
    public void setPendientes(int pendientes) { this.pendientes = pendientes; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}
