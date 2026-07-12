package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.dto.CursoRequest;
import com.universidad.sistema_academico.entity.Curso;
import com.universidad.sistema_academico.entity.Especialidad;
import com.universidad.sistema_academico.repository.CursoRepository;
import com.universidad.sistema_academico.repository.EspecialidadRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/cursos")
@PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('DIRECCION')")
public class AdminCursoController {

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @GetMapping
    public List<Curso> listar() {
        return cursoRepository.findAll(Sort.by(Sort.Order.asc("ciclo"), Sort.Order.asc("codigo")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> ver(@PathVariable Long id) {
        return cursoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CursoRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            if (cursoRepository.findByCodigo(request.getCodigo()).isPresent()) {
                throw new RuntimeException("Ya existe un curso con el codigo " + request.getCodigo());
            }

            Especialidad especialidad = especialidadRepository.findById(request.getEspecialidadId())
                    .orElseThrow(() -> new RuntimeException("La especialidad especificada no existe"));

            Curso curso = new Curso();
            curso.setCodigo(request.getCodigo());
            curso.setNombre(request.getNombre());
            curso.setCreditos(request.getCreditos());
            curso.setHorasSemanales(request.getHorasSemanales());
            curso.setCiclo(request.getCiclo());
            curso.setEspecialidad(especialidad);

            if (request.getPrerequisitoId() != null) {
                Curso prereq = cursoRepository.findById(request.getPrerequisitoId())
                        .orElseThrow(() -> new RuntimeException("El prerequisito especificado no existe"));
                validarPrerequisito(prereq, especialidad, request.getCiclo());
                curso.setPrerequisito(prereq);
            }

            return ResponseEntity.ok(cursoRepository.save(curso));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody CursoRequest request, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(errores(result));
        }
        try {
            Curso curso = cursoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("El curso no existe"));

            Optional<Curso> duplicado = cursoRepository.findByCodigo(request.getCodigo());
            if (duplicado.isPresent() && !duplicado.get().getId().equals(id)) {
                throw new RuntimeException("Ya existe otro curso con el codigo " + request.getCodigo());
            }

            Especialidad especialidad = especialidadRepository.findById(request.getEspecialidadId())
                    .orElseThrow(() -> new RuntimeException("La especialidad especificada no existe"));

            if (request.getPrerequisitoId() != null) {
                if (request.getPrerequisitoId().equals(id)) {
                    throw new RuntimeException("Un curso no puede ser prerequisito de si mismo");
                }
                Curso prereq = cursoRepository.findById(request.getPrerequisitoId())
                        .orElseThrow(() -> new RuntimeException("El prerequisito especificado no existe"));
                validarPrerequisito(prereq, especialidad, request.getCiclo());
                curso.setPrerequisito(prereq);
            } else {
                curso.setPrerequisito(null);
            }

            curso.setCodigo(request.getCodigo());
            curso.setNombre(request.getNombre());
            curso.setCreditos(request.getCreditos());
            curso.setHorasSemanales(request.getHorasSemanales());
            curso.setCiclo(request.getCiclo());
            curso.setEspecialidad(especialidad);

            return ResponseEntity.ok(cursoRepository.save(curso));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            Curso curso = cursoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("El curso no existe"));

            // Check if this course is a prerequisite for another course
            // If we try to delete it directly, SQL foreign key constraint will fail,
            // but we can give a nicer error message.
            List<Curso> dependientes = cursoRepository.findAll();
            for (Curso c : dependientes) {
                if (c.getPrerequisito() != null && c.getPrerequisito().getId().equals(id)) {
                    throw new RuntimeException("No se puede eliminar el curso porque es prerrequisito de '" + c.getNombre() + "'.");
                }
            }

            cursoRepository.delete(curso);
            return ResponseEntity.ok(Map.of("message", "Curso eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** El prerequisito debe ser de la misma especialidad y de un ciclo anterior al del curso */
    private void validarPrerequisito(Curso prereq, Especialidad especialidad, Integer ciclo) {
        if (!prereq.getEspecialidad().getId().equals(especialidad.getId())) {
            throw new RuntimeException("El prerequisito debe pertenecer a la misma especialidad del curso");
        }
        if (ciclo != null && prereq.getCiclo() >= ciclo) {
            throw new RuntimeException("El prerequisito debe ser de un ciclo menor al del curso");
        }
    }

    private Map<String, String> errores(BindingResult result) {
        Map<String, String> errores = new HashMap<>();
        result.getFieldErrors().forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
        return errores;
    }
}
