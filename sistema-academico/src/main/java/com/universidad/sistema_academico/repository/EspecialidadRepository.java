package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Especialidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {
    Optional<Especialidad> findByCodigo(String codigo);
    List<Especialidad> findByFacultadId(Long facultadId);
}
