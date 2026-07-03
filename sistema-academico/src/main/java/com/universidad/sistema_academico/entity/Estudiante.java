package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "estudiantes")
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @Column(unique = true, nullable = false, length = 15)
    private String codigoEstudiante;

    @Column(unique = true, nullable = false, length = 8)
    private String dni;

    @ManyToOne(optional = false)
    @JoinColumn(name = "especialidad_id")
    private Especialidad especialidad;

    @Column(nullable = false)
    private Integer cicloActual = 1;

    @Column(nullable = false)
    private Integer anioIngreso;

    private String telefono;

    private String direccion;

    private LocalDate fechaNacimiento;
}
