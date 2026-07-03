package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Facultad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacultadRepository extends JpaRepository<Facultad, Long> {
    Optional<Facultad> findByCodigo(String codigo);
}
