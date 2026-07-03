package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.AsignacionDocente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AsignacionDocenteRepository extends JpaRepository<AsignacionDocente, Long> {
    List<AsignacionDocente> findByDocenteIdAndPeriodoId(Long docenteId, Long periodoId);
    List<AsignacionDocente> findByDocenteId(Long docenteId);
    List<AsignacionDocente> findByPeriodoId(Long periodoId);
    List<AsignacionDocente> findByPeriodoIdAndCursoEspecialidadId(Long periodoId, Long especialidadId);
    List<AsignacionDocente> findByPeriodoIdAndCursoEspecialidadIdAndCursoCiclo(Long periodoId, Long especialidadId, Integer ciclo);
    Optional<AsignacionDocente> findFirstByCursoIdAndPeriodoId(Long cursoId, Long periodoId);
    long countByDocenteIdAndPeriodoId(Long docenteId, Long periodoId);
}
