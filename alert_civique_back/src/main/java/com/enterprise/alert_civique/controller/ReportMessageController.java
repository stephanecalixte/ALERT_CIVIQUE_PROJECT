package com.enterprise.alert_civique.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.enterprise.alert_civique.dto.ReportMessageDTO;
import com.enterprise.alert_civique.service.ReportMessageService;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;




@RestController
@RequestMapping("/api/reportMessages")
public class ReportMessageController {

    private final ReportMessageService reportMessageService;

    public ReportMessageController(ReportMessageService reportMessageService) {
        this.reportMessageService = reportMessageService;
    }

    @PostMapping
    public ResponseEntity<ReportMessageDTO> createReportMessage(@RequestBody ReportMessageDTO dto) {
        ReportMessageDTO createdReportMessage = reportMessageService.createReportMessage(dto);
        return new ResponseEntity<>(createdReportMessage, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ReportMessageDTO>> getAllReportMessages() {
        List<ReportMessageDTO> reportMessages = reportMessageService.getAllReportMessage();
        return new ResponseEntity<>(reportMessages, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportMessageDTO> getReportMessageById(@PathVariable Long id) {
        Optional<ReportMessageDTO> reportMessage = reportMessageService.getReportMessageById(id);
        return reportMessage.map(msg -> new ResponseEntity<>(msg, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReportMessage(@PathVariable Long id) {
        reportMessageService.deleteReportMessage(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /** Cartes de signalement pour le chat — chargées au démarrage de l'app */
    @GetMapping("/chat")
    public ResponseEntity<List<ReportMessageDTO>> getChatReportMessages() {
        return new ResponseEntity<>(reportMessageService.getChatReportMessages(), HttpStatus.OK);
    }
}
