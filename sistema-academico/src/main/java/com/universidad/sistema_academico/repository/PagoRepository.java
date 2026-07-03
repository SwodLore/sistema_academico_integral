package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    Optional<Pago> findByMatriculaId(Long matriculaId);
    Optional<Pago> findByNumeroRecibo(String numeroRecibo);
}
