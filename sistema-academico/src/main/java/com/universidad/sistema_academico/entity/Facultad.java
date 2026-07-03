package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "facultades")
public class Facultad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 10)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;
}
