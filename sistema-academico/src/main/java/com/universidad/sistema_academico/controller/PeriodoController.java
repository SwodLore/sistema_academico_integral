package com.universidad.sistema_academico.controller;

import com.universidad.sistema_academico.repository.PeriodoAcademicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/periodos")
public class PeriodoController {

    @Autowired
    private PeriodoAcademicoRepository periodoRepository;

    @GetMapping
    public ResponseEntity<?> listarPeriodos() {
        try {
            return ResponseEntity.ok(periodoRepository.findAll(Sort.by(
                    Sort.Order.desc("anio"),
                    Sort.Order.desc("semestre")
            )));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
