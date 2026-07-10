package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.LoginRequest;
import com.universidad.sistema_academico.dto.LoginResponse;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.repository.UsuarioRepository;
import com.universidad.sistema_academico.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private HttpServletRequest httpRequest;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            auditoriaService.registrar(usuario, "auth", "LOGIN", "Contrasena incorrecta", "ERROR", httpRequest.getRemoteAddr());
            throw new RuntimeException("Credenciales incorrectas");
        }

        if (!usuario.isActivo()) {
            auditoriaService.registrar(usuario, "auth", "LOGIN", "Cuenta desactivada", "ERROR", httpRequest.getRemoteAddr());
            throw new RuntimeException("La cuenta esta desactivada");
        }

        String token = jwtUtil.generarToken(usuario.getEmail(), usuario.getRol().name());

        auditoriaService.registrar(usuario, "auth", "LOGIN", "Inicio de sesion", "EXITO", httpRequest.getRemoteAddr());

        return new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getEmail(),
                usuario.getRol()
        );
    }
}
