package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.AnalysisDTO;
import com.enterprise.alert_civique.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping
    public ResponseEntity<List<AnalysisDTO>> getAllAnalyses() {
        return ResponseEntity.ok(analysisService.getAllAnalyses());
    }

    @GetMapping("/{analysisId}")
    public ResponseEntity<AnalysisDTO> getAnalysisById(@PathVariable Long analysisId) {
        Optional<AnalysisDTO> analysis = analysisService.getAnalysisById(analysisId);
        return analysis.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<List<AnalysisDTO>> getAnalysesByReportId(@PathVariable Long reportId) {
        return ResponseEntity.ok(analysisService.getAnalysesByReportId(reportId));
    }

    @GetMapping("/ai-validation/{aiValidationId}")
    public ResponseEntity<List<AnalysisDTO>> getAnalysesByAiValidationId(@PathVariable Long aiValidationId) {
        return ResponseEntity.ok(analysisService.getAnalysesByAiValidationId(aiValidationId));
    }

    @GetMapping("/type/{analysisType}")
    public ResponseEntity<List<AnalysisDTO>> getAnalysesByType(@PathVariable String analysisType) {
        return ResponseEntity.ok(analysisService.getAnalysesByType(analysisType));
    }

    @PostMapping
    public ResponseEntity<AnalysisDTO> createAnalysis(@RequestBody AnalysisDTO dto) {
        AnalysisDTO created = analysisService.createAnalysis(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{analysisId}")
    public ResponseEntity<AnalysisDTO> updateAnalysis(@PathVariable Long analysisId,
                                                      @RequestBody AnalysisDTO dto) {
        AnalysisDTO updated = analysisService.updateAnalysis(analysisId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{analysisId}")
    public ResponseEntity<AnalysisDTO> deleteAnalysis(@PathVariable Long analysisId) {
        AnalysisDTO deleted = analysisService.deleteAnalysis(analysisId);
        return ResponseEntity.ok(deleted);
    }
}