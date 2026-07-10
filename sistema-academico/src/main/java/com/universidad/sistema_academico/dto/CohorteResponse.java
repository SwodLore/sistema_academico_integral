package com.universidad.sistema_academico.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CohorteResponse {
    private Long especialidadId;
    private String especialidad;
    private Integer anioIngreso;

    private int ingresantes;
    private int activos;
    private int egresados;
    private int inactivos;      // ni activos ni egresados (desercion)
    private BigDecimal tasaRetencion;   // (activos + egresados) / ingresantes * 100

    private int creditosCarrera;
    private BigDecimal promedioCreditosAprobados;   // creditos aprobados promedio por estudiante

    private List<PuntoEvolucionDTO> evolucion = new ArrayList<>();

    public CohorteResponse() {}

    public Long getEspecialidadId() { return especialidadId; }
    public void setEspecialidadId(Long especialidadId) { this.especialidadId = especialidadId; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public Integer getAnioIngreso() { return anioIngreso; }
    public void setAnioIngreso(Integer anioIngreso) { this.anioIngreso = anioIngreso; }

    public int getIngresantes() { return ingresantes; }
    public void setIngresantes(int ingresantes) { this.ingresantes = ingresantes; }

    public int getActivos() { return activos; }
    public void setActivos(int activos) { this.activos = activos; }

    public int getEgresados() { return egresados; }
    public void setEgresados(int egresados) { this.egresados = egresados; }

    public int getInactivos() { return inactivos; }
    public void setInactivos(int inactivos) { this.inactivos = inactivos; }

    public BigDecimal getTasaRetencion() { return tasaRetencion; }
    public void setTasaRetencion(BigDecimal tasaRetencion) { this.tasaRetencion = tasaRetencion; }

    public int getCreditosCarrera() { return creditosCarrera; }
    public void setCreditosCarrera(int creditosCarrera) { this.creditosCarrera = creditosCarrera; }

    public BigDecimal getPromedioCreditosAprobados() { return promedioCreditosAprobados; }
    public void setPromedioCreditosAprobados(BigDecimal p) { this.promedioCreditosAprobados = p; }

    public List<PuntoEvolucionDTO> getEvolucion() { return evolucion; }
    public void setEvolucion(List<PuntoEvolucionDTO> evolucion) { this.evolucion = evolucion; }
}
