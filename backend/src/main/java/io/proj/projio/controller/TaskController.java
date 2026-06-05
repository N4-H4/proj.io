package io.proj.projio.controller;

import io.proj.projio.dto.request.TaskRequest;
import io.proj.projio.dto.response.TaskResponse;
import io.proj.projio.enums.TaskStatus;
import io.proj.projio.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Cross-project task listing
    @GetMapping("/api/v1/tasks")
    public ResponseEntity<List<TaskResponse>> getAllUserTasks(
            @RequestParam(required = false) TaskStatus status) {
        return ResponseEntity.ok(taskService.getAllUserTasks(status));
    }

    // Project-scoped task operations
    @GetMapping("/api/v1/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @GetMapping("/api/v1/projects/{projectId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTask(projectId, taskId));
    }

    @PostMapping("/api/v1/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(projectId, request));
    }

    @PutMapping("/api/v1/projects/{projectId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(projectId, taskId, request));
    }

    @PutMapping("/api/v1/projects/{projectId}/tasks/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body) {
        TaskStatus status = TaskStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(taskService.updateTaskStatus(projectId, taskId, status));
    }

    @DeleteMapping("/api/v1/projects/{projectId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId) {
        taskService.deleteTask(projectId, taskId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/v1/projects/{projectId}/tasks/reorder")
    public ResponseEntity<List<TaskResponse>> reorderTasks(
            @PathVariable Long projectId,
            @RequestBody List<Long> taskIds) {
        return ResponseEntity.ok(taskService.reorderTasks(projectId, taskIds));
    }
}
