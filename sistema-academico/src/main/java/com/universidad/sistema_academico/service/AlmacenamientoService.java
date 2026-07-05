package com.universidad.sistema_academico.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AlmacenamientoService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String guardarComprobante(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException("El archivo del comprobante esta vacio");
        }

        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("El comprobante debe ser una imagen");
        }

        try {
            Path carpeta = Paths.get(uploadDir);
            Files.createDirectories(carpeta);

            String nombre = "comprobante_" + UUID.randomUUID() + extension(archivo.getOriginalFilename());
            Path destino = carpeta.resolve(nombre);
            archivo.transferTo(destino.toAbsolutePath());

            return "/uploads/" + nombre;
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar el comprobante");
        }
    }

    private String extension(String nombreOriginal) {
        if (nombreOriginal == null) {
            return "";
        }
        int punto = nombreOriginal.lastIndexOf('.');
        return punto >= 0 ? nombreOriginal.substring(punto) : "";
    }
}
