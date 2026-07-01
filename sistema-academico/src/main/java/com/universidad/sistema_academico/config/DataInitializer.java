package com.universidad.sistema_academico.config;

import com.universidad.sistema_academico.entity.Rol;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNombres("Admin");
            admin.setApellidos("Prueba");
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setCodigoUsuario("ADM001");
            admin.setRol(Rol.ADMINISTRADOR);
            admin.setActivo(true);

            usuarioRepository.save(admin);
            System.out.println("Usuario de prueba creado: admin@test.com / 123456");
        }
    }
}
