package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.PeriodoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {
    Optional<PeriodoAcademico> findByCodigo(String codigo);
    Optional<PeriodoAcademico> findByActivoTrue();
}
