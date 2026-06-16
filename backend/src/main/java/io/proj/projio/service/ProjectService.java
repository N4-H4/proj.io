package io.proj.projio.service;

import io.proj.projio.dto.request.ProjectRequest;
import io.proj.projio.dto.response.ProjectResponse;
import io.proj.projio.entity.ActivityLog;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.ProjectStatus;
import io.proj.projio.enums.WorkflowStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.ActivityLogRepository;
import io.proj.projio.repository.ProjectRepository;
import io.proj.projio.repository.WorkflowPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkflowPhaseRepository workflowPhaseRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserService userService;

    // Default SDLC phases created with every new project
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

    public List<ProjectResponse> getAllProjects(ProjectStatus status, Boolean archived) {
        Long userId = userService.getCurrentUserId();
        List<Project> projects;

        if (status != null && archived != null) {
            projects = projectRepository.findByUserIdAndStatusAndArchivedOrderByCreatedAtDesc(userId, status, archived);
        } else if (archived != null) {
            projects = projectRepository.findByUserIdAndArchivedOrderByCreatedAtDesc(userId, archived);
        } else {
            projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return projects.stream().map(ProjectResponse::from).collect(Collectors.toList());
    }

    public ProjectResponse getProject(Long id) {
        Project project = findProjectByIdAndUser(id);
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = Project.builder()
                .user(userService.getCurrentUser())
                .title(request.getTitle())
                .description(request.getDescription())
                .domain(request.getDomain())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNED)
                .startDate(request.getStartDate())
                .deadline(request.getDeadline())
                .build();

        Project savedProject = projectRepository.save(project);

        // Auto-create the 8 SDLC workflow phases
        for (int i = 0; i < DEFAULT_PHASES.length; i++) {
            WorkflowPhase phase = WorkflowPhase.builder()
                    .project(savedProject)
                    .name(DEFAULT_PHASES[i][0])
                    .description(DEFAULT_PHASES[i][1])
                    .status(WorkflowStatus.NOT_STARTED)
                    .phaseOrder(i)
                    .build();
            workflowPhaseRepository.save(phase);
        }

        // Persist initial progress (0% — all phases NOT_STARTED)
        savedProject.setProgress(0);
        savedProject = projectRepository.save(savedProject);

        // Log activity
        logActivity("CREATED_PROJECT", "PROJECT", savedProject.getId(),
                savedProject.getTitle(), savedProject.getTitle(), savedProject.getId());

        return ProjectResponse.from(savedProject);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProjectByIdAndUser(id);

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDomain(request.getDomain());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());

        Project saved = projectRepository.save(project);

        // Log activity
        logActivity("UPDATED_PROJECT", "PROJECT", saved.getId(),
                saved.getTitle(), saved.getTitle(), saved.getId());

        return ProjectResponse.from(saved);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = findProjectByIdAndUser(id);
        String title = project.getTitle();
        Long projectId = project.getId();
        projectRepository.delete(project);

        // Log activity
        logActivity("DELETED_PROJECT", "PROJECT", projectId,
                title, title, null);
    }

    @Transactional
    public ProjectResponse archiveProject(Long id, boolean archived) {
        Project project = findProjectByIdAndUser(id);
        project.setArchived(archived);
        return ProjectResponse.from(projectRepository.save(project));
    }

    public Project findProjectByIdAndUser(Long id) {
        Long userId = userService.getCurrentUserId();
        return projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    private void logActivity(String action, String entityType, Long entityId,
                             String title, String projectTitle, Long projectId) {
        ActivityLog log = ActivityLog.builder()
                .user(userService.getCurrentUser())
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .title(title)
                .projectTitle(projectTitle)
                .projectId(projectId)
                .build();
        activityLogRepository.save(log);
    }
}
