package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.LogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

    /** HU-26: log de auditoría para dirección, con filtros opcionales y paginación */
    @Query("""
            SELECT l FROM LogAuditoria l
            WHERE (:usuarioId IS NULL OR l.usuario.id = :usuarioId)
              AND (:modulo IS NULL OR l.modulo = :modulo)
              AND (:desde IS NULL OR l.fecha >= :desde)
              AND (:hasta IS NULL OR l.fecha <= :hasta)
            ORDER BY l.fecha DESC
            """)
    Page<LogAuditoria> buscar(@Param("usuarioId") Long usuarioId,
                              @Param("modulo") String modulo,
                              @Param("desde") LocalDateTime desde,
                              @Param("hasta") LocalDateTime hasta,
                              Pageable pageable);
}
