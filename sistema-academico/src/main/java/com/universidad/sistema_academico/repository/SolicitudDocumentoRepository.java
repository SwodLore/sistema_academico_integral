package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.EstadoSolicitud;
import com.universidad.sistema_academico.entity.SolicitudDocumento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitudDocumentoRepository extends JpaRepository<SolicitudDocumento, Long> {
    List<SolicitudDocumento> findByEstudianteIdOrderByFechaSolicitudDesc(Long estudianteId);
    List<SolicitudDocumento> findByEstadoOrderByFechaSolicitudAsc(EstadoSolicitud estado);
    Optional<SolicitudDocumento> findByCodigoVerificacion(String codigoVerificacion);
}
