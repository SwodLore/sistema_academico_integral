package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "matricula_id", unique = true)
    private Matricula matricula;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false)
    private LocalDateTime fechaPago = LocalDateTime.now();

    @Column(length = 30)
    private String metodoPago;

    @Column(unique = true, length = 20)
    private String numeroRecibo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "registrado_por_id")
    private Usuario registradoPor;
}
