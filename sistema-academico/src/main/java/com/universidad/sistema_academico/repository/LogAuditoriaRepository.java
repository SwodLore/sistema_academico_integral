package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.LogAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {
    /** HU-26: log de auditoría para dirección */
    List<LogAuditoria> findAllByOrderByFechaDesc();
    List<LogAuditoria> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
    List<LogAuditoria> findByModuloOrderByFechaDesc(String modulo);
}
