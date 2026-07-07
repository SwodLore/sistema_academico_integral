package com.universidad.sistema_academico.entity;

public enum EstadoActa {
    ABIERTA,        // El docente aún puede registrar/editar notas
    OBSERVADA,      // El administrador la devolvió con observaciones; el docente puede corregir
    VALIDADA,       // Consolidada oficialmente por el administrador
    CERRADA
}
