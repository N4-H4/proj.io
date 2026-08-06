package io.proj.projio.controller;

import io.proj.projio.dto.request.WorkflowPhaseRequest;
import io.proj.projio.dto.response.WorkflowPhaseResponse;
import io.proj.projio.service.WorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for WorkflowPhase operations.
 *
 * <p>Phase status is no longer manually settable — it is derived automatically
 * from task completion by {@link io.proj.projio.service.WorkflowTaskService}.
 * The {@code PUT /{phaseId}} endpoint has been removed accordingly.
 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @GetMapping
    public ResponseEntity<List<WorkflowPhaseResponse>> getPhases(@PathVariable Long projectId) {
        return ResponseEntity.ok(workflowService.getPhases(projectId));
    }

    /**
     * Internal infrastructure endpoint — reserved for Admin panels, AI override agents,
     * and disaster-recovery tooling. NOT connected to any frontend UI.
     *
     * <p>Normal phase status transitions are handled automatically by the task-completion
     * engine in {@link io.proj.projio.service.WorkflowTaskService}. Calling this endpoint
     * bypasses that engine; a subsequent task mutation will re-derive the status.
     */
    @PutMapping("/{phaseId}")
    public ResponseEntity<WorkflowPhaseResponse> updatePhaseStatus(
            @PathVariable Long projectId,
            @PathVariable Long phaseId,
            @Valid @RequestBody WorkflowPhaseRequest request) {
        return ResponseEntity.ok(workflowService.updatePhaseStatus(projectId, phaseId, request));
    }

    @PutMapping("/active-phase")
    public ResponseEntity<Void> updateActivePhase(
            @PathVariable Long projectId,
            @RequestParam Long phaseId) {

        workflowService.updateActivePhase(projectId, phaseId);
        return ResponseEntity.noContent().build();
    }
}
