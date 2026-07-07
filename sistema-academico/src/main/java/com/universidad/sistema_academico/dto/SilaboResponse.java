package com.universidad.sistema_academico.dto;

import java.time.LocalDateTime;

public class SilaboResponse {
    private Long asignacionId;
    private String cursoCodigo;
    private String cursoNombre;
    private String seccion;
    private String docenteNombre;
    private String competencias;
    private String contenido;
    private String bibliografia;
    private LocalDateTime fechaActualizacion;

    private String silaboNombre;
    private String silaboUrl;

    public SilaboResponse() {}

    public SilaboResponse(Long asignacionId, String cursoCodigo, String cursoNombre, String seccion,
                          String docenteNombre, String competencias, String contenido, String bibliografia,
                          LocalDateTime fechaActualizacion, String silaboNombre, String silaboUrl) {
        this.asignacionId = asignacionId;
        this.cursoCodigo = cursoCodigo;
        this.cursoNombre = cursoNombre;
        this.seccion = seccion;
        this.docenteNombre = docenteNombre;
        this.competencias = competencias;
        this.contenido = contenido;
        this.bibliografia = bibliografia;
        this.fechaActualizacion = fechaActualizacion;
        this.silaboNombre = silaboNombre;
        this.silaboUrl = silaboUrl;
    }

    public Long getAsignacionId() { return asignacionId; }
    public void setAsignacionId(Long asignacionId) { this.asignacionId = asignacionId; }

    public String getCursoCodigo() { return cursoCodigo; }
    public void setCursoCodigo(String cursoCodigo) { this.cursoCodigo = cursoCodigo; }

    public String getCursoNombre() { return cursoNombre; }
    public void setCursoNombre(String cursoNombre) { this.cursoNombre = cursoNombre; }

    public String getSeccion() { return seccion; }
    public void setSeccion(String seccion) { this.seccion = seccion; }

    public String getDocenteNombre() { return docenteNombre; }
    public void setDocenteNombre(String docenteNombre) { this.docenteNombre = docenteNombre; }

    public String getCompetencias() { return competencias; }
    public void setCompetencias(String competencias) { this.competencias = competencias; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public String getBibliografia() { return bibliografia; }
    public void setBibliografia(String bibliografia) { this.bibliografia = bibliografia; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getSilaboNombre() { return silaboNombre; }
    public void setSilaboNombre(String silaboNombre) { this.silaboNombre = silaboNombre; }

    public String getSilaboUrl() { return silaboUrl; }
    public void setSilaboUrl(String silaboUrl) { this.silaboUrl = silaboUrl; }
}
