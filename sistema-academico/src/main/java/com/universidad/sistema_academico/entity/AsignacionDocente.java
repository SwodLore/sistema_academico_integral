package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "asignaciones_docente", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"curso_id", "periodo_id", "seccion"})
})
public class AsignacionDocente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @ManyToOne(optional = false)
    @JoinColumn(name = "docente_id")
    private Docente docente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "periodo_id")
    private PeriodoAcademico periodo;

    @Column(nullable = false, length = 2)
    private String seccion = "A";

    private String silaboUrl;

    private String silaboNombre;

    private LocalDateTime fechaCargaSilabo;

    @Column(columnDefinition = "TEXT")
    private String competencias;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    @Column(columnDefinition = "TEXT")
    private String bibliografia;
}
