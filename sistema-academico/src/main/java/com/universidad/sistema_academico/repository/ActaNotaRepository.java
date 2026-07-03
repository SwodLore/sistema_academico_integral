package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.ActaNota;
import com.universidad.sistema_academico.entity.EstadoActa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ActaNotaRepository extends JpaRepository<ActaNota, Long> {
    Optional<ActaNota> findByAsignacionId(Long asignacionId);
    List<ActaNota> findByEstado(EstadoActa estado);
    List<ActaNota> findByAsignacionPeriodoId(Long periodoId);
}
