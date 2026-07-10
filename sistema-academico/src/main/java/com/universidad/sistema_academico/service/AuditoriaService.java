package com.universidad.sistema_academico.service;

import com.universidad.sistema_academico.dto.LogAuditoriaResponse;
import com.universidad.sistema_academico.dto.PaginaResponse;
import com.universidad.sistema_academico.entity.LogAuditoria;
import com.universidad.sistema_academico.entity.Usuario;
import com.universidad.sistema_academico.repository.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AuditoriaService {

    @Autowired
    private LogAuditoriaRepository logAuditoriaRepository;

    /** Registra una acción en el log sin interrumpir la operación principal si falla. */
    public void registrar(Usuario usuario, String modulo, String accion, String detalle, String resultado, String ip) {
        try {
            LogAuditoria log = new LogAuditoria();
            log.setUsuario(usuario);
            log.setModulo(truncar(modulo, 30));
            log.setAccion(truncar(accion, 50));
            log.setDetalle(truncar(detalle, 500));
            log.setResultado(truncar(resultado, 10));
            log.setIp(truncar(ip, 45));
            logAuditoriaRepository.save(log);
        } catch (Exception e) {
            // la auditoría nunca debe romper la operación que se está auditando
        }
    }

    public PaginaResponse<LogAuditoriaResponse> listar(Long usuarioId, String modulo, LocalDate desde, LocalDate hasta,
                                                       int page, int size) {
        LocalDateTime fechaDesde = desde != null ? desde.atStartOfDay() : null;
        LocalDateTime fechaHasta = hasta != null ? hasta.atTime(23, 59, 59) : null;

        Page<LogAuditoriaResponse> resultado = logAuditoriaRepository
                .buscar(usuarioId, modulo, fechaDesde, fechaHasta, PageRequest.of(page, size))
                .map(this::aResponse);

        return PaginaResponse.de(resultado);
    }

    private LogAuditoriaResponse aResponse(LogAuditoria log) {
        LogAuditoriaResponse response = new LogAuditoriaResponse();
        response.setId(log.getId());
        response.setUsuarioId(log.getUsuario().getId());
        response.setUsuarioNombre(log.getUsuario().getNombres() + " " + log.getUsuario().getApellidos());
        response.setUsuarioEmail(log.getUsuario().getEmail());
        response.setModulo(log.getModulo());
        response.setAccion(log.getAccion());
        response.setDetalle(log.getDetalle());
        response.setResultado(log.getResultado());
        response.setIp(log.getIp());
        response.setFecha(log.getFecha());
        return response;
    }

    private String truncar(String valor, int max) {
        if (valor == null) return null;
        return valor.length() <= max ? valor : valor.substring(0, max);
    }
}
