package io.proj.projio.service;

import io.proj.projio.dto.request.TaskRequest;
import io.proj.projio.dto.response.TaskResponse;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.Task;
import io.proj.projio.enums.TaskStatus;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.ProjectRepository;
import io.proj.projio.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService;

    public List<TaskResponse> getTasksByProject(Long projectId) {
        verifyProjectOwnership(projectId);
        return taskRepository.findByProjectIdOrderByPositionAsc(projectId)
                .stream().map(TaskResponse::from).collect(Collectors.toList());
    }

    public List<TaskResponse> getAllUserTasks(TaskStatus status) {
        Long userId = userService.getCurrentUserId();
        List<Task> tasks;

        if (status != null) {
            tasks = taskRepository.findAllByUserIdAndStatus(userId, status);
        } else {
            tasks = taskRepository.findAllByUserId(userId);
        }

        return tasks.stream().map(TaskResponse::from).collect(Collectors.toList());
    }

    public TaskResponse getTask(Long projectId, Long taskId) {
        verifyProjectOwnership(projectId);
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest request) {
        Project project = verifyProjectOwnership(projectId);

        int maxPosition = taskRepository.findMaxPositionByProjectId(projectId);

        Task task = Task.builder()
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .priority(request.getPriority() != null ? request.getPriority() : io.proj.projio.enums.TaskPriority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .position(maxPosition + 1)
                .build();

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long projectId, Long taskId, TaskRequest request) {
        verifyProjectOwnership(projectId);
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long projectId, Long taskId, TaskStatus status) {
        verifyProjectOwnership(projectId);
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        task.setStatus(status);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long projectId, Long taskId) {
        verifyProjectOwnership(projectId);
        Task task = taskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        taskRepository.delete(task);
    }

    @Transactional
    public List<TaskResponse> reorderTasks(Long projectId, List<Long> taskIds) {
        verifyProjectOwnership(projectId);

        for (int i = 0; i < taskIds.size(); i++) {
            final int index = i;
            Task task = taskRepository.findByIdAndProjectId(taskIds.get(index), projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskIds.get(index)));
            task.setPosition(index);
            taskRepository.save(task);
        }

        return taskRepository.findByProjectIdOrderByPositionAsc(projectId)
                .stream().map(TaskResponse::from).collect(Collectors.toList());
    }

    private Project verifyProjectOwnership(Long projectId) {
        Long userId = userService.getCurrentUserId();
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
    }
}
