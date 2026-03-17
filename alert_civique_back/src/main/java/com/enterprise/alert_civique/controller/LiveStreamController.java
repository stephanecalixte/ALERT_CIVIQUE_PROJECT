package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import com.enterprise.alert_civique.mapper.LiveStreamMapperService;
import com.enterprise.alert_civique.service.LiveStreamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/livestream")
public class LiveStreamController {

    private final LiveStreamService liveStreamService;
    private final LiveStreamMapperService liveStreamMapper;

    public LiveStreamController(LiveStreamService liveStreamService, LiveStreamMapperService liveStreamMapper) {
        this.liveStreamService = liveStreamService;
        this.liveStreamMapper = liveStreamMapper;
    }

    @PostMapping("/create")
    public ResponseEntity<LiveStreamDTO> createLive(@RequestBody LiveStreamDTO dto) {
        try {
            LiveStream created = liveStreamService.createLiveStream(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(liveStreamMapper.toDTO(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/update")
    public ResponseEntity<LiveStreamDTO> updateLive(@RequestBody LiveStreamDTO dto) {
        try {
            LiveStream updated = liveStreamService.updateLiveStream(dto);
            return ResponseEntity.ok(liveStreamMapper.toDTO(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<LiveStreamDTO> deleteLive(@PathVariable("id") Long id) {
        try {
            LiveStream deleted = liveStreamService.deleteLiveStream(id);
            return ResponseEntity.ok(liveStreamMapper.toDTO(deleted));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<LiveStreamDTO>> getAll() {
        List<LiveStream> list = liveStreamService.getALLLiveStream();
        List<LiveStreamDTO> dtos = list.stream().map(liveStreamMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiveStreamDTO> getById(@PathVariable("id") Long id) {
        try {
            return liveStreamService.getLiveStreamById(id)
                    .map(entity -> ResponseEntity.ok(liveStreamMapper.toDTO(entity)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
