package com.universidad.sistema_academico.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/** Respuesta paginada estable para el frontend (evita serializar Page directamente). */
public class PaginaResponse<T> {

    private List<T> content;
    private int number;
    private int size;
    private int totalPages;
    private long totalElements;
    private boolean first;
    private boolean last;

    public static <T> PaginaResponse<T> de(Page<T> page) {
        PaginaResponse<T> response = new PaginaResponse<>();
        response.content = page.getContent();
        response.number = page.getNumber();
        response.size = page.getSize();
        response.totalPages = page.getTotalPages();
        response.totalElements = page.getTotalElements();
        response.first = page.isFirst();
        response.last = page.isLast();
        return response;
    }

    public List<T> getContent() { return content; }
    public int getNumber() { return number; }
    public int getSize() { return size; }
    public int getTotalPages() { return totalPages; }
    public long getTotalElements() { return totalElements; }
    public boolean isFirst() { return first; }
    public boolean isLast() { return last; }
}
