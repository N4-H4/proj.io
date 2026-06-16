package io.proj.projio.service;

import io.proj.projio.dto.request.WorkflowPhaseRequest;
import io.proj.projio.dto.response.WorkflowPhaseResponse;
import io.proj.projio.entity.ActivityLog;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.WorkflowStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.ActivityLogRepository;
import io.proj.projio.repository.ProjectRepository;
import io.proj.projio.repository.WorkflowPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowPhaseRepository workflowPhaseRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ProjectService projectService;
    private final UserService userService;

    // Default SDLC phases for legacy project auto-healing
    private static final String[][] DEFAULT_PHASES = {
            {"Requirement Gathering", "Define project scope, user needs, and functional requirements."},
            {"Feasibility Study", "Assess technical, financial, and operational feasibility."},
            {"System Analysis", "Analyze system requirements and define specifications."},
            {"Software Design", "Create architecture, UI/UX mockups, and database schema."},
            {"Implementation / Coding", "Write code, build features, and integrate components."},
            {"Testing", "Perform unit, integration, and user acceptance testing."},
            {"Integration", "Combine modules, connect APIs, and validate end-to-end flow."},
            {"Deployment & Maintenance", "Deploy to production, monitor, and maintain the application."},
    };

    /**
     * Fetch all workflow phases for a project, sorted strictly by phaseOrder.
     * Auto-heals legacy projects that have 0 phases linked.
     */
    @Transactional
    public List<WorkflowPhaseResponse> getPhases(Long projectId) {
        // Verify project belongs to current user
        Project project = projectService.findProjectByIdAndUser(projectId);

        List<WorkflowPhase> phases = workflowPhaseRepository
                .findByProjectIdOrderByPhaseOrderAsc(projectId);

        // Legacy auto-healing: create default phases if none exist
        if (phases.isEmpty()) {
            phases = createDefaultPhases(project);
            recalculateAndPersistProgress(project);
        }

        return phases.stream()
                .map(WorkflowPhaseResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Update a phase's status and trigger project progress recalculation.
     */
    @Transactional
    public WorkflowPhaseResponse updatePhaseStatus(Long projectId, Long phaseId, WorkflowPhaseRequest request) {
        // Verify project belongs to current user
        Project project = projectService.findProjectByIdAndUser(projectId);

        WorkflowPhase phase = workflowPhaseRepository.findByIdAndProjectId(phaseId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowPhase", "id", phaseId));

        phase.setStatus(request.getStatus());
        WorkflowPhase saved = workflowPhaseRepository.save(phase);

        // Recalculate and persist project progress
        recalculateAndPersistProgress(project);

        // Log activity
        ActivityLog log = ActivityLog.builder()
                .user(userService.getCurrentUser())
                .action("UPDATED_WORKFLOW")
                .entityType("WORKFLOW")
                .entityId(saved.getId())
                .title(saved.getName() + " → " + request.getStatus().name().replace("_", " "))
                .projectTitle(project.getTitle())
                .projectId(project.getId())
                .build();
        activityLogRepository.save(log);

        return WorkflowPhaseResponse.from(saved);
    }

    /**
     * Calculate progress: (COMPLETED phases / total phases) * 100.
     * Returns a clean integer percentage (e.g. 25, not 25.0).
     */
    private int calculateProgress(Long projectId) {
        long total = workflowPhaseRepository.countByProjectId(projectId);
        if (total == 0) return 0;
        long completed = workflowPhaseRepository.countByProjectIdAndStatus(projectId, WorkflowStatus.COMPLETED);
        return (int) Math.round((completed * 100.0) / total);
    }

    /**
     * Recalculate workflow progress and persist to the Project entity.
     */
    private void recalculateAndPersistProgress(Project project) {
        int progress = calculateProgress(project.getId());
        project.setProgress(progress);
        projectRepository.save(project);
    }

    /**
     * Create the 8 default SDLC workflow phases for a project.
     * Used for legacy project auto-healing.
     */
    private List<WorkflowPhase> createDefaultPhases(Project project) {
        List<WorkflowPhase> phases = new ArrayList<>();
        for (int i = 0; i < DEFAULT_PHASES.length; i++) {
            WorkflowPhase phase = WorkflowPhase.builder()
                    .project(project)
                    .name(DEFAULT_PHASES[i][0])
                    .description(DEFAULT_PHASES[i][1])
                    .status(WorkflowStatus.NOT_STARTED)
                    .phaseOrder(i)
                    .build();
            phases.add(workflowPhaseRepository.save(phase));
        }
        return phases;
    }
}
