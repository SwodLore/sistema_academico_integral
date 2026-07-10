package com.universidad.sistema_academico.config;

import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.repository.UsuarioRepository;
import com.universidad.sistema_academico.service.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

/**
 * HU-26: registra en el log de auditoría toda petición de escritura
 * (POST, PUT, PATCH, DELETE) hecha por un usuario autenticado.
 */
@Component
public class AuditoriaInterceptor implements HandlerInterceptor {

    private static final Set<String> METODOS_ESCRITURA = Set.of("POST", "PUT", "PATCH", "DELETE");

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        if (!METODOS_ESCRITURA.contains(request.getMethod())) return;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails userDetails)) return;

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (usuario == null) return;

        boolean exito = response.getStatus() < 400 && ex == null;

        auditoriaService.registrar(
                usuario,
                extraerModulo(request.getRequestURI()),
                request.getMethod() + " " + request.getRequestURI(),
                null,
                exito ? "EXITO" : "ERROR",
                request.getRemoteAddr()
        );
    }

    /** /api/admin/usuarios/5 -> "usuarios", /api/matriculas -> "matriculas" */
    private String extraerModulo(String uri) {
        String[] partes = uri.split("/");
        for (String parte : partes) {
            if (parte.isBlank() || parte.equals("api") || parte.equals("admin")) continue;
            return parte;
        }
        return "general";
    }
}
