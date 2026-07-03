package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Nota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotaRepository extends JpaRepository<Nota, Long> {
    Optional<Nota> findByDetalleId(Long detalleId);
    List<Nota> findByDetalleAsignacionId(Long asignacionId);
    List<Nota> findByDetalleMatriculaEstudianteIdAndDetalleMatriculaPeriodoId(Long estudianteId, Long periodoId);
    List<Nota> findByDetalleMatriculaEstudianteId(Long estudianteId);
}
