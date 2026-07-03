package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.EstadoMatricula;
import com.universidad.sistema_academico.entity.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    Optional<Matricula> findByEstudianteIdAndPeriodoId(Long estudianteId, Long periodoId);
    List<Matricula> findByEstudianteIdOrderByPeriodoAnioAscPeriodoSemestreAsc(Long estudianteId);
    List<Matricula> findByEstadoOrderByFechaSolicitudAsc(EstadoMatricula estado);
    List<Matricula> findByPeriodoId(Long periodoId);
    long countByPeriodoIdAndEstudianteEspecialidadId(Long periodoId, Long especialidadId);
    long countByPeriodoIdAndEstado(Long periodoId, EstadoMatricula estado);
}
