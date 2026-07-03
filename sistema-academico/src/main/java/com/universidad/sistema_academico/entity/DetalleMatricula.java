package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "detalles_matricula", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"matricula_id", "asignacion_id"})
})
public class DetalleMatricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "matricula_id")
    private Matricula matricula;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asignacion_id")
    private AsignacionDocente asignacion;
}
