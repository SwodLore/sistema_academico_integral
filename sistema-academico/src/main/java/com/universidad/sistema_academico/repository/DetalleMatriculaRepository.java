package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.DetalleMatricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleMatriculaRepository extends JpaRepository<DetalleMatricula, Long> {
    List<DetalleMatricula> findByMatriculaId(Long matriculaId);
    List<DetalleMatricula> findByAsignacionId(Long asignacionId);
    List<DetalleMatricula> findByMatriculaEstudianteId(Long estudianteId);
}
