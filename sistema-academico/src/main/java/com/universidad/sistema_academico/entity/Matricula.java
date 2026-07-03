package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "matriculas", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"estudiante_id", "periodo_id"})
})
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "estudiante_id")
    private Estudiante estudiante;

    @ManyToOne(optional = false)
    @JoinColumn(name = "periodo_id")
    private PeriodoAcademico periodo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private EstadoMatricula estado = EstadoMatricula.PENDIENTE;

    @Column(nullable = false)
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    private LocalDateTime fechaValidacion;

    @ManyToOne
    @JoinColumn(name = "validada_por_id")
    private Usuario validadaPor;

    @Column(length = 300)
    private String observacion;

    @Column(unique = true, length = 20)
    private String numeroFicha;
}
