package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.HistoryDTO;
import com.enterprise.alert_civique.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping
    public ResponseEntity<List<HistoryDTO>> getAllHistories() {
        return ResponseEntity.ok(historyService.getAllHistories());
    }

    @GetMapping("/{historyId}")
    public ResponseEntity<HistoryDTO> getHistoryById(@PathVariable Long historyId) {
        Optional<HistoryDTO> history = historyService.getHistoryById(historyId);
        return history.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HistoryDTO> createHistory(@RequestBody HistoryDTO dto) {
        HistoryDTO created = historyService.createHistory(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{historyId}")
    public ResponseEntity<HistoryDTO> updateHistory(@PathVariable Long historyId,
                                                    @RequestBody HistoryDTO dto) {
        HistoryDTO updated = historyService.updateHistory(historyId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{historyId}")
    public ResponseEntity<HistoryDTO> deleteHistory(@PathVariable Long historyId) {
        HistoryDTO deleted = historyService.deleteHistory(historyId);
        return ResponseEntity.ok(deleted);
    }
}