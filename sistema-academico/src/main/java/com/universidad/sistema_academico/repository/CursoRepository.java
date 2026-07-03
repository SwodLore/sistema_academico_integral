package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    Optional<Curso> findByCodigo(String codigo);
    List<Curso> findByEspecialidadId(Long especialidadId);
    List<Curso> findByEspecialidadIdAndCiclo(Long especialidadId, Integer ciclo);
}
