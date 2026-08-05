package io.proj.projio.dto.response;

import io.proj.projio.entity.Project;
import io.proj.projio.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {

    private Long id;
    private String title;
    private String description;
    private String domain;
    private ProjectStatus status;
    private LocalDate startDate;
    private Boolean archived;
    private int taskCount;
    private int completedTaskCount;
    private int progress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long activePhaseId;

    public static ProjectResponse from(Project project) {
        int totalTasks = project.getTasks() != null ? project.getTasks().size() : 0;
        int doneTasks = project.getTasks() != null
                ? (int) project.getTasks().stream()
                    .filter(t -> t.getStatus() == io.proj.projio.enums.TaskStatus.DONE)
                    .count()
                : 0;
        int progressPct = project.getProgress() != null ? project.getProgress() : 0;

        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .domain(project.getDomain())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .archived(project.getArchived())
                .taskCount(totalTasks)
                .completedTaskCount(doneTasks)
                .progress(progressPct)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .activePhaseId(project.getActivePhaseId())
                .build();
    }
}
