package io.proj.projio.controller;

import io.proj.projio.dto.request.WorkflowTaskRequest;
import io.proj.projio.dto.response.WorkflowTaskResponse;
import io.proj.projio.service.WorkflowTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for WorkflowTask CRUD operations.
 *
 * <p>Routes are flat — ownership is verified server-side through the phase → project chain.
 */
@RestController
@RequestMapping("/api/v1/workflow-tasks")
@RequiredArgsConstructor
public class WorkflowTaskController {

    private final WorkflowTaskService workflowTaskService;

    // ── GET /api/v1/workflow-tasks/phase/{phaseId} ───────────────────────────

    @GetMapping("/phase/{phaseId}")
    public ResponseEntity<List<WorkflowTaskResponse>> getTasks(@PathVariable Long phaseId) {
        return ResponseEntity.ok(workflowTaskService.getTasksByPhase(phaseId));
    }

    // ── POST /api/v1/workflow-tasks ──────────────────────────────────────────

    @PostMapping
    public ResponseEntity<WorkflowTaskResponse> createTask(
            @RequestBody WorkflowTaskRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(workflowTaskService.createTask(request));
    }

    // ── PATCH /api/v1/workflow-tasks/{id} ────────────────────────────────────

    @PatchMapping("/{id}")
    public ResponseEntity<WorkflowTaskResponse> patchTask(
            @PathVariable Long id,
            @RequestBody WorkflowTaskRequest request) {
        return ResponseEntity.ok(workflowTaskService.patchTask(id, request));
    }

    // ── DELETE /api/v1/workflow-tasks/{id} ───────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        workflowTaskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
