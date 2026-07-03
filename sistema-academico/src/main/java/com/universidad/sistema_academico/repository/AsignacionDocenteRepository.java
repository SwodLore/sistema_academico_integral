package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.AsignacionDocente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AsignacionDocenteRepository extends JpaRepository<AsignacionDocente, Long> {
    List<AsignacionDocente> findByDocenteIdAndPeriodoId(Long docenteId, Long periodoId);
    List<AsignacionDocente> findByDocenteId(Long docenteId);
    List<AsignacionDocente> findByPeriodoId(Long periodoId);
    List<AsignacionDocente> findByPeriodoIdAndCursoEspecialidadId(Long periodoId, Long especialidadId);
    long countByDocenteIdAndPeriodoId(Long docenteId, Long periodoId);
}
