package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "logs_auditoria")
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 30)
    private String modulo;

    @Column(nullable = false, length = 50)
    private String accion;

    @Column(length = 500)
    private String detalle;

    @Column(nullable = false, length = 10)
    private String resultado = "EXITO";

    @Column(length = 45)
    private String ip;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
}
