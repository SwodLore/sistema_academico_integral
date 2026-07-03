package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
    Optional<Estudiante> findByUsuarioId(Long usuarioId);
    Optional<Estudiante> findByCodigoEstudiante(String codigoEstudiante);
    Optional<Estudiante> findByDni(String dni);
    List<Estudiante> findByEspecialidadId(Long especialidadId);
    List<Estudiante> findByEspecialidadIdAndAnioIngreso(Long especialidadId, Integer anioIngreso);
}
