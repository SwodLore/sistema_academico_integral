package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Docente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocenteRepository extends JpaRepository<Docente, Long> {
    Optional<Docente> findByUsuarioId(Long usuarioId);
    Optional<Docente> findByCodigoDocente(String codigoDocente);
    Optional<Docente> findByDni(String dni);
}
