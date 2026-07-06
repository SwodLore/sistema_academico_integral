package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.UsuarioRequest;
import com.universidad.sistema_academico.dto.UsuarioResponse;
import com.universidad.sistema_academico.entity.*;
import com.universidad.sistema_academico.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminUsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private DocenteRepository docenteRepository;

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @Autowired
    private FacultadRepository facultadRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> listar(Rol rol) {
        List<Usuario> usuarios = rol != null
                ? usuarioRepository.findByRolOrderByIdDesc(rol)
                : usuarioRepository.findAllByOrderByIdDesc();

        List<UsuarioResponse> respuesta = new ArrayList<>();
        for (Usuario usuario : usuarios) {
            respuesta.add(aResponse(usuario));
        }
        return respuesta;
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }

        Usuario usuario = new Usuario();
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol());
        usuario.setActivo(true);
        usuario.setPassword(passwordEncoder.encode(request.getDni()));
        usuario = usuarioRepository.save(usuario);

        usuario.setCodigoUsuario(prefijoRol(request.getRol()) + String.format("%05d", usuario.getId()));
        usuario = usuarioRepository.save(usuario);

        crearPerfil(usuario, request);

        return aResponse(usuario);
    }

    @Transactional
    public UsuarioResponse editar(Long id, UsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El usuario no existe"));

        if (!usuario.getEmail().equals(request.getEmail()) && usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }

        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol());
        usuarioRepository.save(usuario);

        actualizarPerfil(usuario, request);

        return aResponse(usuario);
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El usuario no existe"));
        usuario.setActivo(activo);
        return aResponse(usuarioRepository.save(usuario));
    }

    private void crearPerfil(Usuario usuario, UsuarioRequest request) {
        if (request.getRol() == Rol.ESTUDIANTE) {
            Estudiante estudiante = new Estudiante();
            estudiante.setUsuario(usuario);
            estudiante.setCodigoEstudiante("EST" + String.format("%05d", usuario.getId()));
            estudiante.setDni(request.getDni());
            estudiante.setEspecialidad(buscarEspecialidad(request.getEspecialidadId()));
            estudiante.setCicloActual(request.getCiclo() != null ? request.getCiclo() : 1);
            estudiante.setAnioIngreso(request.getAnioIngreso());
            estudianteRepository.save(estudiante);
        } else if (request.getRol() == Rol.DOCENTE) {
            Docente docente = new Docente();
            docente.setUsuario(usuario);
            docente.setCodigoDocente("DOC" + String.format("%05d", usuario.getId()));
            docente.setDni(request.getDni());
            docente.setGradoAcademico(request.getGradoAcademico());
            if (request.getFacultadId() != null) {
                docente.setFacultad(buscarFacultad(request.getFacultadId()));
            }
            docenteRepository.save(docente);
        }
    }

    private void actualizarPerfil(Usuario usuario, UsuarioRequest request) {
        if (request.getRol() == Rol.ESTUDIANTE) {
            Estudiante estudiante = estudianteRepository.findByUsuarioId(usuario.getId())
                    .orElseGet(() -> {
                        Estudiante nuevo = new Estudiante();
                        nuevo.setUsuario(usuario);
                        nuevo.setCodigoEstudiante("EST" + String.format("%05d", usuario.getId()));
                        return nuevo;
                    });
            estudiante.setDni(request.getDni());
            estudiante.setEspecialidad(buscarEspecialidad(request.getEspecialidadId()));
            if (request.getCiclo() != null) estudiante.setCicloActual(request.getCiclo());
            estudiante.setAnioIngreso(request.getAnioIngreso());
            estudianteRepository.save(estudiante);
        } else if (request.getRol() == Rol.DOCENTE) {
            Docente docente = docenteRepository.findByUsuarioId(usuario.getId())
                    .orElseGet(() -> {
                        Docente nuevo = new Docente();
                        nuevo.setUsuario(usuario);
                        nuevo.setCodigoDocente("DOC" + String.format("%05d", usuario.getId()));
                        return nuevo;
                    });
            docente.setDni(request.getDni());
            docente.setGradoAcademico(request.getGradoAcademico());
            if (request.getFacultadId() != null) {
                docente.setFacultad(buscarFacultad(request.getFacultadId()));
            }
            docenteRepository.save(docente);
        }
    }

    private Especialidad buscarEspecialidad(Long id) {
        if (id == null) {
            throw new RuntimeException("La especialidad es obligatoria para un estudiante");
        }
        return especialidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La especialidad no existe"));
    }

    private Facultad buscarFacultad(Long id) {
        return facultadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("La facultad no existe"));
    }

    private String prefijoRol(Rol rol) {
        return switch (rol) {
            case ESTUDIANTE -> "EST";
            case DOCENTE -> "DOC";
            case ADMINISTRADOR -> "ADM";
            case DIRECCION -> "DIR";
        };
    }

    private UsuarioResponse aResponse(Usuario usuario) {
        UsuarioResponse r = new UsuarioResponse();
        r.setId(usuario.getId());
        r.setNombres(usuario.getNombres());
        r.setApellidos(usuario.getApellidos());
        r.setEmail(usuario.getEmail());
        r.setCodigoUsuario(usuario.getCodigoUsuario());
        r.setRol(usuario.getRol());
        r.setActivo(usuario.isActivo());

        if (usuario.getRol() == Rol.ESTUDIANTE) {
            estudianteRepository.findByUsuarioId(usuario.getId()).ifPresent(e -> {
                r.setDni(e.getDni());
                r.setEspecialidad(e.getEspecialidad().getNombre());
                r.setEspecialidadId(e.getEspecialidad().getId());
                r.setCiclo(e.getCicloActual());
                r.setAnioIngreso(e.getAnioIngreso());
            });
        } else if (usuario.getRol() == Rol.DOCENTE) {
            docenteRepository.findByUsuarioId(usuario.getId()).ifPresent(d -> {
                r.setDni(d.getDni());
                r.setGradoAcademico(d.getGradoAcademico());
                if (d.getFacultad() != null) {
                    r.setFacultad(d.getFacultad().getNombre());
                    r.setFacultadId(d.getFacultad().getId());
                }
            });
        }
        return r;
    }
}
