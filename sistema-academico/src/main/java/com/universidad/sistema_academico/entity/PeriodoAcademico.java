package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "periodos_academicos")
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String codigo;

    @Column(nullable = false)
    private Integer anio;

    @Column(nullable = false, length = 3)
    private String semestre;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @Column(nullable = false)
    private boolean activo = false;

    @Column(nullable = false)
    private boolean matriculaAbierta = false;
}
