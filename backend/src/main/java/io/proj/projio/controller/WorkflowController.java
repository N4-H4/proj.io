package io.proj.projio.controller;

import io.proj.projio.dto.request.WorkflowPhaseRequest;
import io.proj.projio.dto.response.WorkflowPhaseResponse;
import io.proj.projio.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public ResponseEntity<List<WorkflowPhaseResponse>> getPhases(@PathVariable Long projectId) {
        return ResponseEntity.ok(workflowService.getPhases(projectId));
    }

    @PutMapping("/{phaseId}")
    public ResponseEntity<WorkflowPhaseResponse> updatePhaseStatus(
            @PathVariable Long projectId,
            @PathVariable Long phaseId,
            @Valid @RequestBody WorkflowPhaseRequest request) {
        return ResponseEntity.ok(workflowService.updatePhaseStatus(projectId, phaseId, request));
    }
}
