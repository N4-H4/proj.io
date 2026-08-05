package io.proj.projio.service;

import io.proj.projio.dto.request.WorkflowTaskRequest;
import io.proj.projio.dto.response.WorkflowTaskResponse;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.entity.WorkflowTask;
import io.proj.projio.enums.WorkflowTaskStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.WorkflowPhaseRepository;
import io.proj.projio.repository.WorkflowTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkflowTaskService {

    private final WorkflowTaskRepository workflowTaskRepository;
    private final WorkflowPhaseRepository workflowPhaseRepository;
    private final ProjectService projectService;

    // ── GET /api/v1/workflow-tasks/phase/{phaseId} ───────────────────────────

    /**
     * Returns all tasks for a phase ordered by {@code taskOrder} ASC.
     * Verifies that the phase belongs to a project owned by the current user.
     */
    public List<WorkflowTaskResponse> getTasksByPhase(Long phaseId) {
        WorkflowPhase phase = resolvePhaseForCurrentUser(phaseId);
        return workflowTaskRepository
                .findByWorkflowPhaseIdOrderByTaskOrderAsc(phase.getId())
                .stream()
                .map(WorkflowTaskResponse::from)
                .collect(Collectors.toList());
    }

    // ── POST /api/v1/workflow-tasks ──────────────────────────────────────────

    /**
     * Creates a new task appended at the end of the phase's task list.
     *
     * <p>Required fields: {@code phaseId}, {@code title}.
     * Optional: {@code description} (reserved for AI injection), {@code status} (defaults to {@code TODO}).
     */
    @Transactional
    public WorkflowTaskResponse createTask(WorkflowTaskRequest request) {
        if (request.getPhaseId() == null) {
            throw new IllegalArgumentException("phaseId is required");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("title is required");
        }

        WorkflowPhase phase = resolvePhaseForCurrentUser(request.getPhaseId());
        int nextOrder = workflowTaskRepository.findMaxTaskOrderByPhaseId(phase.getId()) + 1;

        WorkflowTask task = WorkflowTask.builder()
                .workflowPhase(phase)
                .title(request.getTitle().trim())
                .description(request.getDescription())          // nullable; null for MVP manual creation
                .status(WorkflowTaskStatus.TODO)                 // always starts as TODO
                .taskOrder(nextOrder)
                .build();

        return WorkflowTaskResponse.from(workflowTaskRepository.save(task));
    }

    // ── PATCH /api/v1/workflow-tasks/{id} ────────────────────────────────────

    /**
     * Partial update: applies any non-null combination of {@code title},
     * {@code description}, {@code status}, and the legacy {@code completed} boolean.
     *
     * <p><strong>Precedence rule:</strong> if {@code status} is explicitly provided,
     * it is used directly. If only the legacy {@code completed} boolean is provided,
     * it is mapped to {@link WorkflowTaskStatus#DONE} or {@link WorkflowTaskStatus#TODO}.
     * At least one mutable field must be present.
     */
    @Transactional
    public WorkflowTaskResponse patchTask(Long taskId, WorkflowTaskRequest request) {
        WorkflowTask task = resolveTaskForCurrentUser(taskId);

        boolean hasTitle       = request.getTitle()       != null && !request.getTitle().isBlank();
        boolean hasDescription = request.getDescription() != null;
        boolean hasStatus      = request.getStatus()      != null;
        boolean hasCompleted   = request.getCompleted()   != null;

        if (!hasTitle && !hasDescription && !hasStatus && !hasCompleted) {
            throw new IllegalArgumentException(
                    "At least one of title, description, status, or completed must be provided");
        }

        if (hasTitle) {
            task.setTitle(request.getTitle().trim());
        }
        if (hasDescription) {
            task.setDescription(request.getDescription());
        }

        // status takes precedence; fall back to boolean bridge if status absent
        if (hasStatus) {
            task.setStatus(request.getStatus());
        } else if (hasCompleted) {
            task.setStatus(request.getCompleted() ? WorkflowTaskStatus.DONE : WorkflowTaskStatus.TODO);
        }

        return WorkflowTaskResponse.from(workflowTaskRepository.save(task));
    }

    // ── DELETE /api/v1/workflow-tasks/{id} ───────────────────────────────────

    /**
     * Deletes a task after verifying ownership.
     */
    @Transactional
    public void deleteTask(Long taskId) {
        WorkflowTask task = resolveTaskForCurrentUser(taskId);
        workflowTaskRepository.delete(task);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Resolves a phase and verifies its parent project belongs to the current user.
     */
    private WorkflowPhase resolvePhaseForCurrentUser(Long phaseId) {
        WorkflowPhase phase = workflowPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowPhase", "id", phaseId));

        // Verify the parent project belongs to the authenticated user
        projectService.findProjectByIdAndUser(phase.getProject().getId());

        return phase;
    }

    /**
     * Resolves a task and verifies its ancestor project belongs to the current user.
     */
    private WorkflowTask resolveTaskForCurrentUser(Long taskId) {
        WorkflowTask task = workflowTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowTask", "id", taskId));

        // Verify via the phase's parent project
        projectService.findProjectByIdAndUser(task.getWorkflowPhase().getProject().getId());

        return task;
    }
}
