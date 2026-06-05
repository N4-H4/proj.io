package io.proj.projio.controller;

import io.proj.projio.dto.request.BrainDumpNoteRequest;
import io.proj.projio.dto.response.BrainDumpNoteResponse;
import io.proj.projio.service.BrainDumpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brain-dump")
@RequiredArgsConstructor
public class BrainDumpController {

    private final BrainDumpService brainDumpService;

    @GetMapping
    public ResponseEntity<List<BrainDumpNoteResponse>> getAllNotes(
            @RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(brainDumpService.getAllNotes(projectId));
    }

    @GetMapping("/global")
    public ResponseEntity<List<BrainDumpNoteResponse>> getGlobalNotes() {
        return ResponseEntity.ok(brainDumpService.getGlobalNotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrainDumpNoteResponse> getNote(@PathVariable Long id) {
        return ResponseEntity.ok(brainDumpService.getNote(id));
    }

    @PostMapping
    public ResponseEntity<BrainDumpNoteResponse> createNote(
            @Valid @RequestBody BrainDumpNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brainDumpService.createNote(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrainDumpNoteResponse> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody BrainDumpNoteRequest request) {
        return ResponseEntity.ok(brainDumpService.updateNote(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        brainDumpService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
