package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Horario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByAsignacionId(Long asignacionId);
    List<Horario> findByAsignacionPeriodoId(Long periodoId);
}
