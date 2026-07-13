package com.universidad.sistema_academico.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.universidad.sistema_academico.entity.EstadoMatricula;
import com.universidad.sistema_academico.entity.Estudiante;
import com.universidad.sistema_academico.entity.SolicitudDocumento;
import com.universidad.sistema_academico.entity.TipoDocumento;
import com.universidad.sistema_academico.repository.MatriculaRepository;
import io.nayuki.qrcodegen.QrCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class CertificadoPdfService {

    @Autowired(required = false)
    private MatriculaRepository matriculaRepository;

    private static final Color VERDE_UNCP = new Color(20, 84, 44);
    private static final Color DORADO = new Color(176, 141, 66);
    private static final Color GRIS_TEXTO = new Color(60, 60, 60);

    private static final Font UNIVERSIDAD = new Font(Font.TIMES_ROMAN, 17, Font.BOLD, VERDE_UNCP);
    private static final Font FACULTAD = new Font(Font.TIMES_ROMAN, 11, Font.NORMAL, GRIS_TEXTO);
    private static final Font TITULO = new Font(Font.TIMES_ROMAN, 30, Font.BOLD, VERDE_UNCP);
    private static final Font OTORGADO = new Font(Font.TIMES_ROMAN, 12, Font.ITALIC, GRIS_TEXTO);
    private static final Font NOMBRE = new Font(Font.TIMES_ROMAN, 24, Font.BOLDITALIC, Color.BLACK);
    private static final Font CUERPO = new Font(Font.TIMES_ROMAN, 12, Font.NORMAL, GRIS_TEXTO);
    private static final Font FECHA = new Font(Font.TIMES_ROMAN, 11, Font.ITALIC, GRIS_TEXTO);
    private static final Font FIRMA_NOMBRE = new Font(Font.TIMES_ROMAN, 10, Font.BOLD, Color.BLACK);
    private static final Font FIRMA_CARGO = new Font(Font.TIMES_ROMAN, 9, Font.NORMAL, GRIS_TEXTO);

    public byte[] generar(SolicitudDocumento solicitud, String titulo, String urlVerificacion) {
        try {
            Document documento = new Document(PageSize.A4.rotate(), 70, 70, 55, 55);
            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            PdfWriter writer = PdfWriter.getInstance(documento, salida);
            documento.open();

            dibujarMarco(writer, documento.getPageSize());
            dibujarLogo(writer, documento.getPageSize());
            agregarQr(documento, writer, urlVerificacion, solicitud.getCodigoVerificacion());

            Estudiante estudiante = solicitud.getEstudiante();
            String nombreEstudiante = estudiante.getUsuario().getNombres() + " "
                    + estudiante.getUsuario().getApellidos();
            String especialidad = estudiante.getEspecialidad().getNombre();
            String facultad = estudiante.getEspecialidad().getFacultad().getNombre();

            Paragraph universidad = new Paragraph("UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ", UNIVERSIDAD);
            universidad.setAlignment(Element.ALIGN_CENTER);
            documento.add(universidad);

            Paragraph fac = new Paragraph(facultad.toUpperCase(), FACULTAD);
            fac.setAlignment(Element.ALIGN_CENTER);
            fac.setSpacingAfter(4);
            documento.add(fac);

            documento.add(lineaDecorativa());

            Paragraph tituloDoc = new Paragraph(titulo.toUpperCase(), TITULO);
            tituloDoc.setAlignment(Element.ALIGN_CENTER);
            tituloDoc.setSpacingBefore(16);
            documento.add(tituloDoc);

            Paragraph otorgado = new Paragraph("Se otorga el presente documento a:", OTORGADO);
            otorgado.setAlignment(Element.ALIGN_CENTER);
            otorgado.setSpacingBefore(14);
            documento.add(otorgado);

            Paragraph nombre = new Paragraph(nombreEstudiante, NOMBRE);
            nombre.setAlignment(Element.ALIGN_CENTER);
            nombre.setSpacingBefore(6);
            documento.add(nombre);

            Paragraph cuerpo = new Paragraph(cuerpoPorTipo(solicitud, estudiante, especialidad), CUERPO);
            cuerpo.setAlignment(Element.ALIGN_CENTER);
            cuerpo.setSpacingBefore(14);
            cuerpo.setLeading(16);
            documento.add(cuerpo);

            LocalDate fecha = solicitud.getFechaEmision() != null
                    ? solicitud.getFechaEmision().toLocalDate()
                    : LocalDate.now();
            DateTimeFormatter formato = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", Locale.of("es", "PE"));
            Paragraph lugarFecha = new Paragraph("Huancayo, " + fecha.format(formato), FECHA);
            lugarFecha.setAlignment(Element.ALIGN_CENTER);
            lugarFecha.setSpacingBefore(14);
            documento.add(lugarFecha);

            documento.add(firmas(solicitud));

            documento.close();
            return salida.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("No se pudo generar el documento en PDF");
        }
    }

    /** Cuerpo del documento redactado segun el tipo solicitado (cada documento dice algo distinto) */
    private String cuerpoPorTipo(SolicitudDocumento solicitud, Estudiante estudiante, String especialidad) {
        String base = "identificado(a) con DNI N.° " + estudiante.getDni()
                + " y código de estudiante " + estudiante.getCodigoEstudiante()
                + ", de la especialidad de " + especialidad + ", ";

        TipoDocumento tipo = solicitud.getTipo();
        return switch (tipo) {
            case CONSTANCIA_MATRICULA -> base
                    + "se encuentra MATRICULADO(A) en esta casa de estudios"
                    + (periodoMatriculado(estudiante) != null
                        ? " durante el periodo académico " + periodoMatriculado(estudiante) : "")
                    + ", conforme a los registros oficiales. Se expide la presente CONSTANCIA DE MATRÍCULA "
                    + "a solicitud del interesado, para los fines que estime convenientes.";
            case CONSTANCIA_NOTAS -> base
                    + "ha registrado las calificaciones de las asignaturas cursadas, las mismas que obran "
                    + "en los archivos académicos de esta institución. Se expide la presente CONSTANCIA DE "
                    + "NOTAS a solicitud del interesado, para los fines que estime convenientes.";
            case CONSTANCIA_EGRESADO -> base
                    + "ostenta la condición de EGRESADO(A), habiendo culminado el plan de estudios "
                    + "correspondiente a su especialidad conforme a los registros oficiales. Se expide la "
                    + "presente CONSTANCIA DE EGRESADO a solicitud del interesado, para los fines pertinentes.";
            case CONSTANCIA_TERCIO_SUPERIOR -> base
                    + "pertenece al TERCIO SUPERIOR de su promoción, de acuerdo al orden de mérito por "
                    + "promedio ponderado que obra en los archivos académicos. Se expide la presente "
                    + "CONSTANCIA DE TERCIO SUPERIOR a solicitud del interesado, para los fines pertinentes.";
            default -> base
                    + "ha cursado sus estudios conforme a los registros oficiales de esta casa superior de "
                    + "estudios. Se expide el presente CERTIFICADO DE ESTUDIOS a solicitud del interesado, "
                    + "para los fines que estime convenientes.";
        };
    }

    /** Ultimo periodo en que el estudiante quedo matriculado (para la constancia de matricula) */
    private String periodoMatriculado(Estudiante estudiante) {
        if (matriculaRepository == null) return null;
        return matriculaRepository
                .findByEstudianteIdOrderByPeriodoAnioAscPeriodoSemestreAsc(estudiante.getId()).stream()
                .filter(m -> m.getEstado() == EstadoMatricula.MATRICULADO)
                .reduce((primero, ultimo) -> ultimo)
                .map(m -> m.getPeriodo().getCodigo())
                .orElse(null);
    }

    /** Marco doble estilo diploma: borde exterior verde grueso + interior dorado fino */
    private void dibujarMarco(PdfWriter writer, Rectangle pagina) {
        PdfContentByte cb = writer.getDirectContentUnder();

        cb.setColorStroke(VERDE_UNCP);
        cb.setLineWidth(3f);
        cb.rectangle(25, 25, pagina.getWidth() - 50, pagina.getHeight() - 50);
        cb.stroke();

        cb.setColorStroke(DORADO);
        cb.setLineWidth(1.2f);
        cb.rectangle(33, 33, pagina.getWidth() - 66, pagina.getHeight() - 66);
        cb.stroke();
    }

    /** Logo desde resources (static/logo-uncp.png); si no existe, medallon con las iniciales */
    private void dibujarLogo(PdfWriter writer, Rectangle pagina) {
        float x = 62;
        float y = pagina.getHeight() - 108;
        try (InputStream logo = getClass().getResourceAsStream("/static/logo-uncp.png")) {
            if (logo != null) {
                Image imagen = Image.getInstance(logo.readAllBytes());
                imagen.scaleToFit(62, 62);
                imagen.setAbsolutePosition(x, y);
                writer.getDirectContent().addImage(imagen);
                return;
            }
        } catch (Exception ignored) {
        }

        PdfContentByte cb = writer.getDirectContent();
        cb.setColorStroke(DORADO);
        cb.setColorFill(VERDE_UNCP);
        cb.setLineWidth(1.5f);
        cb.circle(x + 31, y + 31, 30);
        cb.fillStroke();
        try {
            cb.beginText();
            cb.setColorFill(Color.WHITE);
            cb.setFontAndSize(com.lowagie.text.pdf.BaseFont.createFont(), 13);
            cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "UNCP", x + 31, y + 26, 0);
            cb.endText();
        } catch (Exception ignored) {
        }
    }

    /** QR real y escaneable en la esquina inferior derecha, con el codigo impreso debajo */
    private void agregarQr(Document documento, PdfWriter writer, String url, String codigo) throws Exception {
        QrCode qr = QrCode.encodeText(url, QrCode.Ecc.MEDIUM);
        int escala = 4;
        int borde = 2;
        int lado = (qr.size + borde * 2) * escala;
        BufferedImage imagen = new BufferedImage(lado, lado, BufferedImage.TYPE_INT_RGB);
        for (int py = 0; py < lado; py++) {
            for (int px = 0; px < lado; px++) {
                int mx = px / escala - borde;
                int my = py / escala - borde;
                boolean negro = mx >= 0 && my >= 0 && mx < qr.size && my < qr.size && qr.getModule(mx, my);
                imagen.setRGB(px, py, negro ? 0x000000 : 0xFFFFFF);
            }
        }

        Rectangle pagina = documento.getPageSize();
        Image qrImagen = Image.getInstance(imagen, null);
        qrImagen.scaleAbsolute(68, 68);
        qrImagen.setAbsolutePosition(pagina.getWidth() - 130, 52);
        writer.getDirectContent().addImage(qrImagen);

        PdfContentByte cb = writer.getDirectContent();
        cb.beginText();
        cb.setColorFill(GRIS_TEXTO);
        cb.setFontAndSize(com.lowagie.text.pdf.BaseFont.createFont(), 5.5f);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, "Verifique este documento escaneando el QR",
                pagina.getWidth() - 96, 46, 0);
        cb.showTextAligned(PdfContentByte.ALIGN_CENTER, codigo, pagina.getWidth() - 96, 39, 0);
        cb.endText();
    }

    private Paragraph lineaDecorativa() {
        Paragraph linea = new Paragraph();
        linea.setSpacingBefore(2);
        linea.add(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1.2f, 42f, DORADO, Element.ALIGN_CENTER, 0)));
        return linea;
    }

    private PdfPTable firmas(SolicitudDocumento solicitud) {
        String emisor = solicitud.getEmitidaPor() != null
                ? solicitud.getEmitidaPor().getNombres() + " " + solicitud.getEmitidaPor().getApellidos()
                : "Secretaría Académica";

        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(72);
        tabla.setSpacingBefore(38);

        tabla.addCell(celdaFirma(emisor, "Secretaría Académica"));
        tabla.addCell(celdaFirma("Dirección Académica", "Universidad Nacional del Centro del Perú"));
        return tabla;
    }

    private PdfPCell celdaFirma(String nombre, String cargo) {
        PdfPCell celda = new PdfPCell();
        celda.setBorder(Rectangle.NO_BORDER);
        celda.setPaddingLeft(28);
        celda.setPaddingRight(28);

        PdfPTable interna = new PdfPTable(1);
        PdfPCell lineaNombre = new PdfPCell(new Phrase(nombre, FIRMA_NOMBRE));
        lineaNombre.setBorder(Rectangle.TOP);
        lineaNombre.setBorderColor(GRIS_TEXTO);
        lineaNombre.setHorizontalAlignment(Element.ALIGN_CENTER);
        lineaNombre.setPaddingTop(5);

        PdfPCell lineaCargo = new PdfPCell(new Phrase(cargo, FIRMA_CARGO));
        lineaCargo.setBorder(Rectangle.NO_BORDER);
        lineaCargo.setHorizontalAlignment(Element.ALIGN_CENTER);

        interna.addCell(lineaNombre);
        interna.addCell(lineaCargo);
        celda.addElement(interna);
        return celda;
    }
}
