package com.universidad.sistema_academico.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.universidad.sistema_academico.dto.ReporteConsolidadoResponse;
import com.universidad.sistema_academico.dto.ReporteEstudianteDTO;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ReportePdfService {

    private static final Font TITULO = new Font(Font.HELVETICA, 16, Font.BOLD);
    private static final Font SUBTITULO = new Font(Font.HELVETICA, 12, Font.BOLD);
    private static final Font NORMAL = new Font(Font.HELVETICA, 10);
    private static final Font NEGRITA = new Font(Font.HELVETICA, 10, Font.BOLD);
    private static final Font CABECERA_TABLA = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font CELDA = new Font(Font.HELVETICA, 9);

    public byte[] generar(ReporteConsolidadoResponse reporte) {
        try {
            Document documento = new Document(PageSize.A4.rotate(), 40, 40, 40, 40);
            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            PdfWriter.getInstance(documento, salida);
            documento.open();

            Paragraph universidad = new Paragraph("Universidad Nacional del Centro del Peru", TITULO);
            universidad.setAlignment(Element.ALIGN_CENTER);
            documento.add(universidad);

            Paragraph titulo = new Paragraph("Reporte Consolidado de Rendimiento", SUBTITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(14);
            documento.add(titulo);

            PdfPTable datos = new PdfPTable(2);
            datos.setWidthPercentage(100);
            datos.setSpacingAfter(12);
            agregarDato(datos, "Especialidad", reporte.getEspecialidad());
            agregarDato(datos, "Periodo", reporte.getPeriodo());
            agregarDato(datos, "Total de estudiantes", String.valueOf(reporte.getTotalEstudiantes()));
            agregarDato(datos, "Promedio general",
                    reporte.getPromedioGeneral() != null ? reporte.getPromedioGeneral().toString() : "-");
            agregarDato(datos, "Aprobados / Desaprobados / En curso",
                    reporte.getAprobados() + " / " + reporte.getDesaprobados() + " / " + reporte.getEnCurso());
            documento.add(datos);

            PdfPTable tabla = new PdfPTable(new float[]{2f, 6f, 1.5f, 1.5f, 1.5f, 1.5f, 2f, 2.5f});
            tabla.setWidthPercentage(100);
            agregarCabecera(tabla, "Codigo", "Estudiante", "Cred.", "Cursos", "Aprob.", "Desap.", "Promedio", "Situacion");

            for (ReporteEstudianteDTO e : reporte.getEstudiantes()) {
                agregarCelda(tabla, e.getCodigo());
                agregarCelda(tabla, e.getNombre());
                agregarCelda(tabla, String.valueOf(e.getCreditos()));
                agregarCelda(tabla, String.valueOf(e.getCursos()));
                agregarCelda(tabla, String.valueOf(e.getAprobados()));
                agregarCelda(tabla, String.valueOf(e.getDesaprobados()));
                agregarCelda(tabla, e.getPromedio() != null ? e.getPromedio().toString() : "-");
                agregarCelda(tabla, e.getSituacion());
            }
            documento.add(tabla);

            if (reporte.getEstudiantes().isEmpty()) {
                Paragraph vacio = new Paragraph("No hay estudiantes matriculados para esta especialidad y periodo.", NORMAL);
                vacio.setSpacingBefore(12);
                documento.add(vacio);
            }

            DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            Paragraph generado = new Paragraph("Documento generado el " + LocalDateTime.now().format(formato), NORMAL);
            generado.setSpacingBefore(20);
            documento.add(generado);

            documento.close();
            return salida.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("No se pudo generar el reporte en PDF");
        }
    }

    private void agregarDato(PdfPTable tabla, String etiqueta, String valor) {
        PdfPCell celda = new PdfPCell(new Phrase(etiqueta, NEGRITA));
        celda.setBorder(Rectangle.NO_BORDER);
        tabla.addCell(celda);
        celda = new PdfPCell(new Phrase(valor, NORMAL));
        celda.setBorder(Rectangle.NO_BORDER);
        tabla.addCell(celda);
    }

    private void agregarCabecera(PdfPTable tabla, String... titulos) {
        for (String titulo : titulos) {
            PdfPCell celda = new PdfPCell(new Phrase(titulo, CABECERA_TABLA));
            celda.setBackgroundColor(new Color(40, 40, 40));
            celda.setPadding(5);
            tabla.addCell(celda);
        }
    }

    private void agregarCelda(PdfPTable tabla, String valor) {
        PdfPCell celda = new PdfPCell(new Phrase(valor, CELDA));
        celda.setPadding(5);
        tabla.addCell(celda);
    }
}
