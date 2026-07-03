package com.universidad.sistema_academico.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "solicitudes_documento")
public class SolicitudDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "estudiante_id")
    private Estudiante estudiante;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoDocumento tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @Column(length = 300)
    private String motivo;

    @Column(nullable = false)
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    private LocalDateTime fechaAutorizacion;

    @ManyToOne
    @JoinColumn(name = "autorizada_por_id")
    private Usuario autorizadaPor;

    private LocalDateTime fechaEmision;

    @ManyToOne
    @JoinColumn(name = "emitida_por_id")
    private Usuario emitidaPor;

    @Column(unique = true, length = 36)
    private String codigoVerificacion;

    private String documentoUrl;
}
