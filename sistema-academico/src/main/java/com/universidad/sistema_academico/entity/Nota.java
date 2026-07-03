package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notas")
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "detalle_matricula_id", unique = true)
    private DetalleMatricula detalle;

    @Column(precision = 4, scale = 2)
    private BigDecimal parcial1;

    @Column(precision = 4, scale = 2)
    private BigDecimal parcial2;

    @Column(precision = 4, scale = 2)
    private BigDecimal notaFinal;

    @Column(precision = 4, scale = 2)
    private BigDecimal promedio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private EstadoNota estado = EstadoNota.PENDIENTE;

    private LocalDateTime fechaActualizacion;
}
