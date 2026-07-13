package com.universidad.sistema_academico.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** Genera PDF (título + subtítulo + tabla) y CSV a partir de cabeceras y filas genéricas. */
@Service
public class ExportService {

    private static final Color VERDE = new Color(20, 84, 44);
    private static final Font TITULO = new Font(Font.HELVETICA, 15, Font.BOLD, VERDE);
    private static final Font SUBTITULO = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(90, 90, 90));
    private static final Font TH = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font TD = new Font(Font.HELVETICA, 9);

    public byte[] pdf(String titulo, String subtitulo, List<String> cabeceras, List<List<String>> filas) {
        try {
            Document doc = new Document(PageSize.A4.rotate(), 40, 40, 40, 40);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(doc, out);
            doc.open();

            Paragraph t = new Paragraph(titulo, TITULO);
            doc.add(t);
            if (subtitulo != null && !subtitulo.isBlank()) {
                Paragraph s = new Paragraph(subtitulo, SUBTITULO);
                s.setSpacingAfter(12);
                doc.add(s);
            }

            PdfPTable tabla = new PdfPTable(cabeceras.size());
            tabla.setWidthPercentage(100);
            tabla.setSpacingBefore(6);

            for (String cab : cabeceras) {
                PdfPCell celda = new PdfPCell(new Phrase(cab, TH));
                celda.setBackgroundColor(VERDE);
                celda.setPadding(6);
                tabla.addCell(celda);
            }

            boolean alterna = false;
            for (List<String> fila : filas) {
                for (String valor : fila) {
                    PdfPCell celda = new PdfPCell(new Phrase(valor != null ? valor : "", TD));
                    celda.setPadding(5);
                    if (alterna) celda.setBackgroundColor(new Color(244, 247, 245));
                    tabla.addCell(celda);
                }
                alterna = !alterna;
            }

            doc.add(tabla);
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("No se pudo generar el PDF del reporte");
        }
    }

    public byte[] csv(List<String> cabeceras, List<List<String>> filas) {
        StringBuilder sb = new StringBuilder();
        sb.append('﻿'); // BOM para que Excel reconozca UTF-8
        sb.append(lineaCsv(cabeceras));
        for (List<String> fila : filas) {
            sb.append(lineaCsv(fila));
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String lineaCsv(List<String> valores) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < valores.size(); i++) {
            if (i > 0) sb.append(';');
            String v = valores.get(i) != null ? valores.get(i) : "";
            if (v.contains(";") || v.contains("\"") || v.contains("\n")) {
                v = "\"" + v.replace("\"", "\"\"") + "\"";
            }
            sb.append(v);
        }
        return sb.append("\r\n").toString();
    }
}
