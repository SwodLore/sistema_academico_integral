package com.universidad.sistema_academico.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.universidad.sistema_academico.dto.CursoDisponibleResponse;
import com.universidad.sistema_academico.entity.Estudiante;
import com.universidad.sistema_academico.entity.Matricula;
import com.universidad.sistema_academico.entity.Pago;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class FichaPdfService {

    private static final Font TITULO = new Font(Font.HELVETICA, 16, Font.BOLD);
    private static final Font SUBTITULO = new Font(Font.HELVETICA, 12, Font.BOLD);
    private static final Font NORMAL = new Font(Font.HELVETICA, 10);
    private static final Font NEGRITA = new Font(Font.HELVETICA, 10, Font.BOLD);
    private static final Font CABECERA_TABLA = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font CELDA = new Font(Font.HELVETICA, 9);

    public byte[] generar(Matricula matricula, List<CursoDisponibleResponse> cursos) {
        try {
            Document documento = new Document(PageSize.A4, 50, 50, 50, 50);
            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            PdfWriter.getInstance(documento, salida);
            documento.open();

            Paragraph universidad = new Paragraph("Universidad Nacional del Centro del Peru", TITULO);
            universidad.setAlignment(Element.ALIGN_CENTER);
            documento.add(universidad);

            Paragraph titulo = new Paragraph("Ficha de Matricula - Periodo " + matricula.getPeriodo().getCodigo(), SUBTITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            documento.add(titulo);

            Estudiante estudiante = matricula.getEstudiante();
            PdfPTable datos = new PdfPTable(2);
            datos.setWidthPercentage(100);
            datos.setSpacingAfter(15);
            agregarDato(datos, "Estudiante", estudiante.getUsuario().getNombres() + " " + estudiante.getUsuario().getApellidos());
            agregarDato(datos, "Codigo", estudiante.getCodigoEstudiante());
            agregarDato(datos, "DNI", estudiante.getDni());
            agregarDato(datos, "Especialidad", estudiante.getEspecialidad().getNombre());
            agregarDato(datos, "Ciclo", String.valueOf(estudiante.getCicloActual()));
            agregarDato(datos, "Estado", matricula.getEstado().name());
            if (matricula.getNumeroFicha() != null) {
                agregarDato(datos, "N° de ficha", matricula.getNumeroFicha());
            }
            documento.add(datos);

            PdfPTable tabla = new PdfPTable(new float[]{2, 5, 2, 4, 1.5f, 4});
            tabla.setWidthPercentage(100);
            agregarCabecera(tabla, "Codigo", "Curso", "Seccion", "Docente", "Cred.", "Horario");

            int totalCreditos = 0;
            for (CursoDisponibleResponse curso : cursos) {
                agregarCelda(tabla, curso.getCodigo());
                agregarCelda(tabla, curso.getNombre());
                agregarCelda(tabla, curso.getSeccion());
                agregarCelda(tabla, curso.getDocente());
                agregarCelda(tabla, String.valueOf(curso.getCreditos()));
                agregarCelda(tabla, String.join("\n", curso.getHorarios()));
                totalCreditos += curso.getCreditos();
            }
            documento.add(tabla);

            Paragraph total = new Paragraph("Total de creditos: " + totalCreditos, NEGRITA);
            total.setSpacingBefore(10);
            documento.add(total);

            DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            Paragraph generado = new Paragraph("Documento generado el " + LocalDateTime.now().format(formato), NORMAL);
            generado.setSpacingBefore(20);
            documento.add(generado);

            documento.close();
            return salida.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("No se pudo generar la ficha en PDF");
        }
    }

    public byte[] generarOficial(Matricula matricula, List<CursoDisponibleResponse> cursos, Pago pago) {
        try {
            Document documento = new Document(PageSize.A4, 50, 50, 50, 50);
            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            PdfWriter.getInstance(documento, salida);
            documento.open();

            Estudiante estudiante = matricula.getEstudiante();
            String facultad = estudiante.getEspecialidad().getFacultad().getNombre();

            Paragraph universidad = new Paragraph("Universidad Nacional del Centro del Peru", TITULO);
            universidad.setAlignment(Element.ALIGN_CENTER);
            documento.add(universidad);

            Paragraph nombreFacultad = new Paragraph(facultad, NORMAL);
            nombreFacultad.setAlignment(Element.ALIGN_CENTER);
            documento.add(nombreFacultad);

            Paragraph titulo = new Paragraph("FICHA OFICIAL DE MATRICULA", SUBTITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingBefore(8);
            documento.add(titulo);

            Paragraph ficha = new Paragraph("N° " + matricula.getNumeroFicha() + "  -  Periodo " + matricula.getPeriodo().getCodigo(), NEGRITA);
            ficha.setAlignment(Element.ALIGN_CENTER);
            ficha.setSpacingAfter(18);
            documento.add(ficha);

            PdfPTable datos = new PdfPTable(2);
            datos.setWidthPercentage(100);
            datos.setSpacingAfter(12);
            agregarDato(datos, "Estudiante", estudiante.getUsuario().getNombres() + " " + estudiante.getUsuario().getApellidos());
            agregarDato(datos, "Codigo", estudiante.getCodigoEstudiante());
            agregarDato(datos, "DNI", estudiante.getDni());
            agregarDato(datos, "Especialidad", estudiante.getEspecialidad().getNombre());
            agregarDato(datos, "Ciclo", String.valueOf(estudiante.getCicloActual()));
            documento.add(datos);

            PdfPTable tabla = new PdfPTable(new float[]{2, 5, 2, 4, 1.5f, 4});
            tabla.setWidthPercentage(100);
            agregarCabecera(tabla, "Codigo", "Curso", "Seccion", "Docente", "Cred.", "Horario");

            int totalCreditos = 0;
            for (CursoDisponibleResponse curso : cursos) {
                agregarCelda(tabla, curso.getCodigo());
                agregarCelda(tabla, curso.getNombre());
                agregarCelda(tabla, curso.getSeccion());
                agregarCelda(tabla, curso.getDocente());
                agregarCelda(tabla, String.valueOf(curso.getCreditos()));
                agregarCelda(tabla, String.join("\n", curso.getHorarios()));
                totalCreditos += curso.getCreditos();
            }
            documento.add(tabla);

            Paragraph total = new Paragraph("Total de creditos: " + totalCreditos, NEGRITA);
            total.setSpacingBefore(10);
            documento.add(total);

            if (pago != null) {
                PdfPTable datosPago = new PdfPTable(2);
                datosPago.setWidthPercentage(100);
                datosPago.setSpacingBefore(12);
                agregarDato(datosPago, "Pago - Monto", "S/. " + pago.getMonto());
                agregarDato(datosPago, "Pago - Recibo", pago.getNumeroRecibo());
                if (pago.getMetodoPago() != null) {
                    agregarDato(datosPago, "Pago - Metodo", pago.getMetodoPago());
                }
                documento.add(datosPago);
            }

            DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            PdfPTable fechas = new PdfPTable(2);
            fechas.setWidthPercentage(100);
            fechas.setSpacingBefore(8);
            agregarDato(fechas, "Fecha de solicitud", matricula.getFechaSolicitud().format(formato));
            if (matricula.getFechaValidacion() != null) {
                agregarDato(fechas, "Fecha de validacion", matricula.getFechaValidacion().format(formato));
            }
            agregarDato(fechas, "Fecha de emision", LocalDateTime.now().format(formato));
            documento.add(fechas);

            documento.add(sello(matricula));

            documento.close();
            return salida.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("No se pudo generar la ficha oficial en PDF");
        }
    }

    private PdfPTable sello(Matricula matricula) {
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        PdfPTable contenedor = new PdfPTable(1);
        contenedor.setWidthPercentage(45);
        contenedor.setHorizontalAlignment(Element.ALIGN_RIGHT);
        contenedor.setSpacingBefore(40);

        String texto = "MATRICULA OFICIAL\nUNCP - FIS\n" + matricula.getNumeroFicha()
                + "\n" + LocalDateTime.now().format(formato);
        PdfPCell celda = new PdfPCell(new Phrase(texto, NEGRITA));
        celda.setHorizontalAlignment(Element.ALIGN_CENTER);
        celda.setVerticalAlignment(Element.ALIGN_MIDDLE);
        celda.setFixedHeight(80);
        celda.setBorderWidth(2);
        celda.setBorderColor(new Color(40, 40, 40));
        contenedor.addCell(celda);
        return contenedor;
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
