package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.DetalleMatricula;
import com.universidad.sistema_academico.entity.EstadoMatricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleMatriculaRepository extends JpaRepository<DetalleMatricula, Long> {
    List<DetalleMatricula> findByMatriculaId(Long matriculaId);
    List<DetalleMatricula> findByAsignacionId(Long asignacionId);
    List<DetalleMatricula> findByMatriculaEstudianteId(Long estudianteId);

    /** Cuántos estudiantes ocupan un cupo en la sección (toda matrícula no rechazada cuenta) */
    long countByAsignacionIdAndMatriculaEstadoNot(Long asignacionId, EstadoMatricula estado);
}
