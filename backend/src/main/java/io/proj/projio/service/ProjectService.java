package io.proj.projio.service;

import io.proj.projio.dto.request.ProjectRequest;
import io.proj.projio.dto.response.ProjectResponse;
import io.proj.projio.entity.ActivityLog;
import io.proj.projio.entity.Project;
import io.proj.projio.enums.ProjectStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.ActivityLogRepository;
import io.proj.projio.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;



@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ActivityLogRepository activityLogRepository;
    private final TemplateService templateService;
    private final UserService userService;


    public Page<ProjectResponse> getAllProjects(int page, int size) {
        Long userId = userService.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        return projectRepository.findByUserId(userId, pageable)
                .map(ProjectResponse::from);
    }

    public ProjectResponse getProject(Long id) {
        Project project = findProjectByIdAndUser(id);
        return ProjectResponse.from(project);
    }

    // ── Safe-default helpers ──────────────────────────────────────────────

    /**
     * Returns a normalised domain string.
     * Null / blank → "GENERAL"; otherwise trims and upper-cases the input.
     */
    private String parseDomain(String value) {
        if (value == null || value.isBlank()) {
            return "GENERAL";
        }
        return value.trim().toUpperCase();
    }

    /**
     * Returns the given status, or {@link ProjectStatus#PLANNED} when null.
     */
    private ProjectStatus safeStatus(ProjectStatus value) {
        return value != null ? value : ProjectStatus.PLANNED;
    }

    // ── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = Project.builder()
                .user(userService.getCurrentUser())
                .title(request.getTitle())
                .description(request.getDescription())
                .domain(parseDomain(request.getDomain()))
                .status(safeStatus(request.getStatus()))
                .startDate(request.getStartDate())
                .build();

        Project savedProject = projectRepository.save(project);

        // Spawn domain-specific workflow phases via TemplateService
        templateService.spawnPhases(savedProject);

        // Log activity
        logActivity("CREATED_PROJECT", "PROJECT", savedProject.getId(),
                savedProject.getTitle(), savedProject.getTitle(), savedProject.getId());

        return ProjectResponse.from(savedProject);
    }

    // ── UPDATE (strict partial-patch delta) ─────────────────────────────────

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProjectByIdAndUser(id);

        // Title — only mutate when the request explicitly provides a non-blank value
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            project.setTitle(request.getTitle());
        }

        // Description — only mutate when explicitly provided (blank is a valid description)
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        // Domain — retain existing value when null/blank; normalise otherwise
        if (request.getDomain() != null && !request.getDomain().isBlank()) {
            project.setDomain(parseDomain(request.getDomain()));
        }

        // Status — retain existing value when null
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        // Start date — retain existing value when null
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }


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
