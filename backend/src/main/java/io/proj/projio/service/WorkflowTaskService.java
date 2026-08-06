package io.proj.projio.service;

import io.proj.projio.dto.request.WorkflowTaskRequest;
import io.proj.projio.dto.response.WorkflowTaskResponse;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.entity.WorkflowTask;
import io.proj.projio.enums.WorkflowStatus;
import io.proj.projio.enums.WorkflowTaskStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.ProjectRepository;
import io.proj.projio.repository.WorkflowPhaseRepository;
import io.proj.projio.repository.WorkflowTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkflowTaskService {

    /**
     * Virtual sentinel index for the "General" criterion.
     *
     * <p>Tasks assigned to General are informational housekeeping and are stored
     * with this index in the DB. They are intentionally excluded from the
     * per-criterion completion checks in {@link #allCriteriaSatisfied}.
     * Using {@code -1} guarantees no collision with the 0-based real indices.
     */
    public static final int GENERAL_CRITERION_INDEX = -1;

    private final WorkflowTaskRepository workflowTaskRepository;
    private final WorkflowPhaseRepository workflowPhaseRepository;
    private final ProjectRepository projectRepository;
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
     * <p>Required fields: {@code phaseId}, {@code title}, {@code criterionIndex}.
     * The {@code criterionIndex} is validated against the parent phase's
     * {@code completionCriteria} newline-split list before persisting.
     * Phase status is recomputed automatically after creation.
     */
    @Transactional
    public WorkflowTaskResponse createTask(WorkflowTaskRequest request) {
        if (request.getPhaseId() == null) {
            throw new IllegalArgumentException("phaseId is required");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (request.getCriterionIndex() == null) {
            throw new IllegalArgumentException("criterionIndex is required");
        }

        WorkflowPhase phase = resolvePhaseForCurrentUser(request.getPhaseId());
        validateCriterionIndex(phase, request.getCriterionIndex());

        int nextOrder = workflowTaskRepository.findMaxTaskOrderByPhaseId(phase.getId()) + 1;

        WorkflowTask task = WorkflowTask.builder()
                .workflowPhase(phase)
                .title(request.getTitle().trim())
                .description(request.getDescription())          // nullable; null for MVP manual creation
                .status(WorkflowTaskStatus.TODO)                 // always starts as TODO
                .taskOrder(nextOrder)
                .criterionIndex(request.getCriterionIndex())
                .build();

        WorkflowTaskResponse response = WorkflowTaskResponse.from(workflowTaskRepository.save(task));
        recomputePhaseStatus(phase);
        return response;
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
     * Phase status is recomputed automatically after every mutation.
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

        WorkflowTaskResponse response = WorkflowTaskResponse.from(workflowTaskRepository.save(task));
        recomputePhaseStatus(task.getWorkflowPhase());
        return response;
    }

    // ── DELETE /api/v1/workflow-tasks/{id} ───────────────────────────────────

    /**
     * Deletes a task after verifying ownership.
     * Phase status is recomputed automatically after deletion.
     */
    @Transactional
    public void deleteTask(Long taskId) {
        WorkflowTask task = resolveTaskForCurrentUser(taskId);
        WorkflowPhase phase = task.getWorkflowPhase();
        workflowTaskRepository.delete(task);
        workflowTaskRepository.flush(); // ensure delete is visible before count queries
        recomputePhaseStatus(phase);
    }

    // ── Phase status recomputation ────────────────────────────────────────────

    /**
     * Derives and persists the {@link WorkflowStatus} of a phase from its tasks.
     *
     * <p>Rules:
     * <ol>
     *   <li>No DONE tasks (across all indices, including General) → {@link WorkflowStatus#NOT_STARTED}</li>
     *   <li>The phase defines real completion criteria AND every criterion (0-based index)
     *       has ≥1 task AND all those tasks are DONE → {@link WorkflowStatus#COMPLETED}</li>
     *   <li>The phase defines NO real criteria AND there is at least one DONE task
     *       (General tasks only) → {@link WorkflowStatus#COMPLETED} (no criteria to block it)</li>
     *   <li>Otherwise → {@link WorkflowStatus#IN_PROGRESS}</li>
     * </ol>
     *
     * <p>Tasks assigned to {@link #GENERAL_CRITERION_INDEX} ({@code -1}) are NEVER
     * evaluated by the per-criterion completion check. They are purely informational.
     *
     * <p>Also recalculates the parent project's progress percentage.
     */
    void recomputePhaseStatus(WorkflowPhase phase) {
        long doneCount = workflowTaskRepository
                .countByWorkflowPhaseIdAndStatus(phase.getId(), WorkflowTaskStatus.DONE);

        List<String> criteria = parseCriteria(phase.getCompletionCriteria());
        WorkflowStatus newStatus;

        if (doneCount == 0) {
            newStatus = WorkflowStatus.NOT_STARTED;
        } else if (criteria.isEmpty()) {
            // Phase has no real acceptance criteria — any done work completes it.
            // (General tasks don't block; if doneCount > 0 we get here.)
            long totalNonGeneral = workflowTaskRepository
                    .countByWorkflowPhaseIdAndCriterionIndexNot(phase.getId(), GENERAL_CRITERION_INDEX);
            if (totalNonGeneral == 0) {
                // Only General tasks exist; phase completes when at least one is done.
                newStatus = WorkflowStatus.COMPLETED;
            } else {
                newStatus = WorkflowStatus.IN_PROGRESS;
            }
        } else if (allCriteriaSatisfied(phase.getId(), criteria.size())) {
            newStatus = WorkflowStatus.COMPLETED;
        } else {
            newStatus = WorkflowStatus.IN_PROGRESS;
        }

        if (newStatus != phase.getStatus()) {
            phase.setStatus(newStatus);
            workflowPhaseRepository.save(phase);
            recalculateProjectProgress(phase);
        }
    }

    /**
     * A criterion at index {@code i} is satisfied if and only if:
     * it has at least one task AND every task for that criterion is DONE.
     *
     * <p>Only loops over 0-based real indices; {@link #GENERAL_CRITERION_INDEX} is never checked.
     */
    private boolean allCriteriaSatisfied(Long phaseId, int criteriaCount) {
        if (criteriaCount == 0) return false;
        for (int i = 0; i < criteriaCount; i++) {
            long total = workflowTaskRepository.countByWorkflowPhaseIdAndCriterionIndex(phaseId, i);
            long done  = workflowTaskRepository.countByWorkflowPhaseIdAndCriterionIndexAndStatus(
                    phaseId, i, WorkflowTaskStatus.DONE);
            if (total == 0 || done != total) return false;
        }
        return true;
    }

    /** Recalculates project progress as (COMPLETED phases / total phases) * 100. */
    private void recalculateProjectProgress(WorkflowPhase phase) {
        Long projectId = phase.getProject().getId();
        long total     = workflowPhaseRepository.countByProjectId(projectId);
        if (total == 0) return;
        long completed = workflowPhaseRepository.countByProjectIdAndStatus(projectId, WorkflowStatus.COMPLETED);
        int  progress  = (int) Math.round((completed * 100.0) / total);
        projectRepository.findById(projectId).ifPresent(project -> {
            project.setProgress(progress);
            projectRepository.save(project);
        });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Validates that {@code criterionIndex} is either:
     * <ul>
     *   <li>{@link #GENERAL_CRITERION_INDEX} ({@code -1}) — the virtual "General" bucket,
     *       accepted unconditionally for any phase, or</li>
     *   <li>A valid 0-based index into the parent phase's
     *       {@code completionCriteria} newline-split list.</li>
     * </ul>
     * Returns HTTP 400 (via {@link IllegalArgumentException}) for any other value.
     */
    private void validateCriterionIndex(WorkflowPhase phase, int criterionIndex) {
        // The virtual "General" criterion is always valid.
        if (criterionIndex == GENERAL_CRITERION_INDEX) {
            return;
        }
        List<String> criteria = parseCriteria(phase.getCompletionCriteria());
        if (criterionIndex < 0 || criterionIndex >= criteria.size()) {
            int maxIndex = criteria.isEmpty() ? -1 : criteria.size() - 1;
            throw new IllegalArgumentException(
                    "criterionIndex " + criterionIndex + " is out of range; phase '"
                            + phase.getName() + "' has " + criteria.size()
                            + " criteria (0-" + maxIndex + ") or use -1 for General");
        }
    }

    /**
     * Splits {@code completionCriteria} on newline, trims, and filters blank lines.
     * Returns an empty list when the field is null or blank.
     */
    static List<String> parseCriteria(String completionCriteria) {
        if (completionCriteria == null || completionCriteria.isBlank()) {
            return List.of();
        }
        return Arrays.stream(completionCriteria.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

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
