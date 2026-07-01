package com.universidad.sistema_academico.dto;

import com.universidad.sistema_academico.entity.Rol;

public class LoginResponse {

    private String token;
    private Long id;
    private String nombres;
    private String apellidos;
    private String email;
    private Rol rol;

    public LoginResponse(String token, Long id, String nombres, String apellidos, String email, Rol rol) {
        this.token = token;
        this.id = id;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.email = email;
        this.rol = rol;
    }

    public String getToken() { return token; }
    public Long getId() { return id; }
    public String getNombres() { return nombres; }
    public String getApellidos() { return apellidos; }
    public String getEmail() { return email; }
    public Rol getRol() { return rol; }
}
