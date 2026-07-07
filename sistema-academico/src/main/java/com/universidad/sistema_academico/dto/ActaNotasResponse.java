package com.universidad.sistema_academico.dto;

import java.util.List;

public class ActaNotasResponse {
    private Long asignacionId;
    private String cursoCodigo;
    private String cursoNombre;
    private String seccion;
    private String periodo;
    private String estadoActa;
    private boolean editable;
    private String observacion;   // comentario del administrador si el acta fue observada

    // Pesos de la formula del promedio (porcentaje)
    private int pesoParcial1;
    private int pesoParcial2;
    private int pesoPracticas;
    private int pesoNotaFinal;

    private int totalEstudiantes;
    private int aprobados;
    private int desaprobados;
    private int pendientes;

    private List<NotaEstudianteDTO> estudiantes;

    public ActaNotasResponse() {}

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

    public String getEstadoActa() { return estadoActa; }
    public void setEstadoActa(String estadoActa) { this.estadoActa = estadoActa; }

    public boolean isEditable() { return editable; }
    public void setEditable(boolean editable) { this.editable = editable; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public int getPesoParcial1() { return pesoParcial1; }
    public void setPesoParcial1(int pesoParcial1) { this.pesoParcial1 = pesoParcial1; }

    public int getPesoParcial2() { return pesoParcial2; }
    public void setPesoParcial2(int pesoParcial2) { this.pesoParcial2 = pesoParcial2; }

    public int getPesoPracticas() { return pesoPracticas; }
    public void setPesoPracticas(int pesoPracticas) { this.pesoPracticas = pesoPracticas; }

    public int getPesoNotaFinal() { return pesoNotaFinal; }
    public void setPesoNotaFinal(int pesoNotaFinal) { this.pesoNotaFinal = pesoNotaFinal; }

    public int getTotalEstudiantes() { return totalEstudiantes; }
    public void setTotalEstudiantes(int totalEstudiantes) { this.totalEstudiantes = totalEstudiantes; }

    public int getAprobados() { return aprobados; }
    public void setAprobados(int aprobados) { this.aprobados = aprobados; }

    public int getDesaprobados() { return desaprobados; }
    public void setDesaprobados(int desaprobados) { this.desaprobados = desaprobados; }

    public int getPendientes() { return pendientes; }
    public void setPendientes(int pendientes) { this.pendientes = pendientes; }

    public List<NotaEstudianteDTO> getEstudiantes() { return estudiantes; }
    public void setEstudiantes(List<NotaEstudianteDTO> estudiantes) { this.estudiantes = estudiantes; }
}
