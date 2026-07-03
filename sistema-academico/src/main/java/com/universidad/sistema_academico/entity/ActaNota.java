package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "actas_nota")
public class ActaNota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "asignacion_id", unique = true)
    private AsignacionDocente asignacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private EstadoActa estado = EstadoActa.ABIERTA;

    private LocalDateTime fechaCierre;

    private LocalDateTime fechaValidacion;

    @ManyToOne
    @JoinColumn(name = "validada_por_id")
    private Usuario validadaPor;

    @Column(length = 300)
    private String observacion;
}
