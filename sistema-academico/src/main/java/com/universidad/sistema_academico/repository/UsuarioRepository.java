package com.universidad.sistema_academico.repository;

import com.universidad.sistema_academico.entity.Rol;
import com.universidad.sistema_academico.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findByRolOrderByIdDesc(Rol rol);
    List<Usuario> findAllByOrderByIdDesc();
}
