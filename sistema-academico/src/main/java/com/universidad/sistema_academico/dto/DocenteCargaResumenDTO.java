package com.universidad.sistema_academico.dto;

public class DocenteCargaResumenDTO {
    private Long docenteId;
    private String codigoDocente;
    private String dni;
    private String nombreCompleto;
    private String gradoAcademico;
    private String facultadNombre;
    private int cantidadCursos;
    private int totalHoras;

    public DocenteCargaResumenDTO() {}

    public DocenteCargaResumenDTO(Long docenteId, String codigoDocente, String dni, String nombreCompleto, String gradoAcademico, String facultadNombre, int cantidadCursos, int totalHoras) {
        this.docenteId = docenteId;
        this.codigoDocente = codigoDocente;
        this.dni = dni;
        this.nombreCompleto = nombreCompleto;
        this.gradoAcademico = gradoAcademico;
        this.facultadNombre = facultadNombre;
        this.cantidadCursos = cantidadCursos;
        this.totalHoras = totalHoras;
    }

    public Long getDocenteId() { return docenteId; }
    public void setDocenteId(Long docenteId) { this.docenteId = docenteId; }

    public String getCodigoDocente() { return codigoDocente; }
    public void setCodigoDocente(String codigoDocente) { this.codigoDocente = codigoDocente; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getGradoAcademico() { return gradoAcademico; }
    public void setGradoAcademico(String gradoAcademico) { this.gradoAcademico = gradoAcademico; }

    public String getFacultadNombre() { return facultadNombre; }
    public void setFacultadNombre(String facultadNombre) { this.facultadNombre = facultadNombre; }

    public int getCantidadCursos() { return cantidadCursos; }
    public void setCantidadCursos(int cantidadCursos) { this.cantidadCursos = cantidadCursos; }

    public int getTotalHoras() { return totalHoras; }
    public void setTotalHoras(int totalHoras) { this.totalHoras = totalHoras; }
}
