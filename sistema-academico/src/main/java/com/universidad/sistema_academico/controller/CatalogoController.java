package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.entity.Especialidad;
import com.universidad.sistema_academico.entity.Facultad;
import com.universidad.sistema_academico.repository.EspecialidadRepository;
import com.universidad.sistema_academico.repository.FacultadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CatalogoController {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @Autowired
    private FacultadRepository facultadRepository;

    @GetMapping("/api/especialidades")
    public List<Especialidad> especialidades() {
        return especialidadRepository.findAll();
    }

    @GetMapping("/api/facultades")
    public List<Facultad> facultades() {
        return facultadRepository.findAll();
    }
}
