package io.proj.projio.service;

import io.proj.projio.dto.request.ProjectRequest;
import io.proj.projio.dto.response.ProjectResponse;
import io.proj.projio.entity.Project;
import io.proj.projio.enums.ProjectStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;

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
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNED)
                .startDate(request.getStartDate())
                .deadline(request.getDeadline())
                .build();

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProjectByIdAndUser(id);

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = findProjectByIdAndUser(id);
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse archiveProject(Long id, boolean archived) {
        Project project = findProjectByIdAndUser(id);
        project.setArchived(archived);
        return ProjectResponse.from(projectRepository.save(project));
    }

    private Project findProjectByIdAndUser(Long id) {
        Long userId = userService.getCurrentUserId();
        return projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }
}
