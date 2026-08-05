package io.proj.projio.service;

import io.proj.projio.dto.request.WorkflowPhaseRequest;
import io.proj.projio.dto.response.WorkflowPhaseResponse;
import io.proj.projio.dto.response.WorkflowTaskResponse;

import io.proj.projio.entity.ActivityLog;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.WorkflowStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.ActivityLogRepository;
import io.proj.projio.repository.ProjectRepository;
import io.proj.projio.repository.WorkflowPhaseRepository;
import io.proj.projio.repository.WorkflowTaskRepository;
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
    private final WorkflowTaskRepository workflowTaskRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ProjectService projectService;
    private final UserService userService;

    // Default SDLC phases for legacy project auto-healing.
    // Columns: [0] name  [1] description (backward-compat)
    //          [2] guidance  [3] expectedOutcome  [4] completionCriteria (newline-separated)
    private static final String[][] DEFAULT_PHASES = {
            {
                "Requirement Gathering",
                "Define project scope, user needs, and functional requirements.",
                "Capture and document all stakeholder needs, business objectives, and system boundaries before any design or coding begins.",
                "A signed-off requirements document with clear functional and non-functional requirements agreed upon by all stakeholders.",
                "Identify all stakeholders and their goals\nConduct stakeholder interviews or workshops\nDocument functional requirements\nDefine non-functional requirements (performance, security, scalability)\nGet written stakeholder sign-off on requirements"
            },
            {
                "Feasibility Study",
                "Assess technical, financial, and operational feasibility.",
                "Evaluate whether the project is viable from technical, financial, and operational perspectives before committing resources to full development.",
                "A feasibility report with a clear go/no-go recommendation backed by technical, financial, and operational analysis.",
                "Assess technical feasibility (technology stack, team skills)\nEvaluate financial feasibility (budget, ROI estimates)\nAnalyse operational feasibility (team capacity, timelines)\nIdentify key risks and mitigation strategies\nDocument findings and obtain stakeholder approval to proceed"
            },
            {
                "System Analysis",
                "Analyze system requirements and define specifications.",
                "Translate business requirements into detailed, unambiguous system specifications that the design and development teams can act on.",
                "A complete System Requirements Specification (SRS) document with detailed functional specs, data flow diagrams, and use cases reviewed by the team.",
                "Define all system use cases and user stories\nProduce data flow diagrams and entity relationships\nDocument system interfaces and integration points\nSpecify data validation and business rules\nReview and sign off the System Requirements Specification"
            },
            {
                "Software Design",
                "Create architecture, UI/UX mockups, and database schema.",
                "Establish the system architecture, component structure, database schema, and UI/UX designs so the entire team is aligned before a single line of code is written.",
                "An approved architecture document, database ERD, and UI/UX designs that developers can implement directly without further ambiguity.",
                "Define system architecture and component boundaries\nDesign the database schema with relationships and indexes\nProduce UI/UX wireframes and high-fidelity mockups\nDocument API contracts and integration interfaces\nGet architecture and design reviewed and approved by the team"
            },
            {
                "Implementation / Coding",
                "Write code, build features, and integrate components.",
                "Build all features iteratively according to the approved designs and specifications, with code reviews and tests completed for each increment.",
                "A fully implemented codebase where all planned features are built, code-reviewed, and passing their unit and integration tests.",
                "Implement features iteratively aligned with the approved design\nWrite unit and integration tests per feature\nConduct code review for every pull request\nMaintain alignment with the system architecture\nDocument implementation decisions and any deviations from spec"
            },
            {
                "Testing",
                "Perform unit, integration, and user acceptance testing.",
                "Verify the system's correctness, completeness, and robustness against all documented requirements and acceptance criteria through structured testing.",
                "A validated system with no outstanding P0 or P1 defects, full test evidence documented, and stakeholder sign-off on acceptance criteria.",
                "Execute unit tests and verify coverage thresholds\nRun integration tests across all components\nConduct User Acceptance Testing (UAT) with stakeholders\nPerform regression testing after each bug fix\nDocument test results and obtain formal sign-off"
            },
            {
                "Integration",
                "Combine modules, connect APIs, and validate end-to-end flow.",
                "Assemble all independently developed modules and external integrations, and verify the system works correctly as a unified whole across all user flows.",
                "A fully integrated system where all modules and external APIs communicate correctly, verified through end-to-end testing across all critical user journeys.",
                "Integrate all application modules and sub-systems\nConnect and validate all external API integrations\nRun end-to-end tests covering all critical user flows\nResolve all integration defects and data inconsistencies\nPerform a full regression pass on the integrated system"
            },
            {
                "Deployment & Maintenance",
                "Deploy to production, monitor, and maintain the application.",
                "Release the system to production safely, establish monitoring and alerting, and put a maintenance process in place to sustain ongoing reliability.",
                "A live production deployment with uptime monitoring active, alerting configured, and a documented maintenance and incident-response runbook in place.",
                "Configure production environment and CI/CD pipeline\nDeploy application to production with a validated rollback plan\nEnable uptime and error-rate monitoring with alerting thresholds\nRun smoke tests against the production environment\nDocument runbook for incident response and routine maintenance"
            },
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

        // Embed tasks into each phase response
        return phases.stream()
                .map(phase -> {
                    List<WorkflowTaskResponse> tasks = workflowTaskRepository
                            .findByWorkflowPhaseIdOrderByTaskOrderAsc(phase.getId())
                            .stream()
                            .map(WorkflowTaskResponse::from)
                            .collect(Collectors.toList());
                    return WorkflowPhaseResponse.from(phase, tasks);
                })
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
        if (total == 0)
            return 0;
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
     * Used for legacy project auto-healing. Tasks are NOT auto-generated;
     * users create them manually via the WorkflowTask API.
     */
    private List<WorkflowPhase> createDefaultPhases(Project project) {
        List<WorkflowPhase> phases = new ArrayList<>();
        for (int i = 0; i < DEFAULT_PHASES.length; i++) {
            WorkflowPhase phase = WorkflowPhase.builder()
                    .project(project)
                    .name(DEFAULT_PHASES[i][0])
                    .description(DEFAULT_PHASES[i][1])          // backward-compat copy
                    .guidance(DEFAULT_PHASES[i][2])
                    .expectedOutcome(DEFAULT_PHASES[i][3])
                    .completionCriteria(DEFAULT_PHASES[i][4])
                    .status(WorkflowStatus.NOT_STARTED)
                    .phaseOrder(i)
                    .build();
            phases.add(workflowPhaseRepository.save(phase));
        }
        return phases;
    }

    @Transactional
    public void updateActivePhase(Long projectId, Long phaseId) {

        // 1. Verify that the project belongs to the current user
        Project project = projectService.findProjectByIdAndUser(projectId);

        // 2. Verify that the phase belongs to this project
        workflowPhaseRepository.findByIdAndProjectId(phaseId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "WorkflowPhase", "id", phaseId));

        // 3. Update only active_phase_id
        int updated = projectRepository.updateActivePhase(projectId, phaseId);

        if (updated == 0) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }
    }
}
