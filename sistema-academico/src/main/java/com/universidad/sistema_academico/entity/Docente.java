package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "docentes")
public class Docente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @Column(unique = true, nullable = false, length = 15)
    private String codigoDocente;

    @Column(unique = true, nullable = false, length = 8)
    private String dni;

    @Column(length = 100)
    private String gradoAcademico;

    private String telefono;

    @ManyToOne
    @JoinColumn(name = "facultad_id")
    private Facultad facultad;
}
