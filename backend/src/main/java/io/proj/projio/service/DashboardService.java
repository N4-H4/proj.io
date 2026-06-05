package io.proj.projio.service;

import io.proj.projio.dto.response.DashboardStatsResponse;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.Task;
import io.proj.projio.enums.ProjectStatus;
import io.proj.projio.enums.TaskStatus;
import io.proj.projio.repository.ProjectRepository;
import io.proj.projio.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;

    public DashboardStatsResponse getStats() {
        Long userId = userService.getCurrentUserId();
        LocalDate today = LocalDate.now();

        // Project stats
        long totalProjects = projectRepository.countByUserId(userId);
        long activeProjects = projectRepository.countByUserIdAndStatus(userId, ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByUserIdAndStatus(userId, ProjectStatus.COMPLETED);
        long archivedProjects = projectRepository.countByUserIdAndArchived(userId, true);

        // Task stats
        long totalTasks = taskRepository.countByUserId(userId);
        long pendingTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO);
        long inProgressTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long completedTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.DONE);

        // Upcoming deadlines
        List<DashboardStatsResponse.DeadlineItem> deadlineItems = new ArrayList<>();

        // Project deadlines
        List<Project> projectDeadlines = projectRepository
                .findByUserIdAndDeadlineNotNullAndDeadlineAfterAndArchivedFalseOrderByDeadlineAsc(userId, today.minusDays(1));
        for (Project p : projectDeadlines) {
            deadlineItems.add(DashboardStatsResponse.DeadlineItem.builder()
                    .type("PROJECT")
                    .id(p.getId())
                    .title(p.getTitle())
                    .deadline(p.getDeadline())
                    .projectTitle(p.getTitle())
                    .daysRemaining(ChronoUnit.DAYS.between(today, p.getDeadline()))
                    .build());
        }

        // Task deadlines
        List<Task> taskDeadlines = taskRepository.findUpcomingDeadlinesByUserId(userId, today);
        for (Task t : taskDeadlines) {
            deadlineItems.add(DashboardStatsResponse.DeadlineItem.builder()
                    .type("TASK")
                    .id(t.getId())
                    .title(t.getTitle())
                    .deadline(t.getDueDate())
                    .projectTitle(t.getProject().getTitle())
                    .daysRemaining(ChronoUnit.DAYS.between(today, t.getDueDate()))
                    .build());
        }

        // Sort all deadlines by date
        deadlineItems.sort((a, b) -> a.getDeadline().compareTo(b.getDeadline()));

        // Limit to 10 upcoming
        if (deadlineItems.size() > 10) {
            deadlineItems = deadlineItems.subList(0, 10);
        }

        return DashboardStatsResponse.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .archivedProjects(archivedProjects)
                .totalTasks(totalTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .completedTasks(completedTasks)
                .upcomingDeadlines(deadlineItems)
                .build();
    }

    public List<DashboardStatsResponse.DeadlineItem> getDeadlines(int days) {
        Long userId = userService.getCurrentUserId();
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(days);

        List<DashboardStatsResponse.DeadlineItem> deadlineItems = new ArrayList<>();

        List<Project> projectDeadlines = projectRepository
                .findByUserIdAndDeadlineNotNullAndDeadlineAfterAndArchivedFalseOrderByDeadlineAsc(userId, today.minusDays(1));
        for (Project p : projectDeadlines) {
            if (!p.getDeadline().isAfter(cutoff)) {
                deadlineItems.add(DashboardStatsResponse.DeadlineItem.builder()
                        .type("PROJECT")
                        .id(p.getId())
                        .title(p.getTitle())
                        .deadline(p.getDeadline())
                        .projectTitle(p.getTitle())
                        .daysRemaining(ChronoUnit.DAYS.between(today, p.getDeadline()))
                        .build());
            }
        }

        List<Task> taskDeadlines = taskRepository.findUpcomingDeadlinesByUserId(userId, today);
        for (Task t : taskDeadlines) {
            if (!t.getDueDate().isAfter(cutoff)) {
                deadlineItems.add(DashboardStatsResponse.DeadlineItem.builder()
                        .type("TASK")
                        .id(t.getId())
                        .title(t.getTitle())
                        .deadline(t.getDueDate())
                        .projectTitle(t.getProject().getTitle())
                        .daysRemaining(ChronoUnit.DAYS.between(today, t.getDueDate()))
                        .build());
            }
        }

        deadlineItems.sort((a, b) -> a.getDeadline().compareTo(b.getDeadline()));
        return deadlineItems;
    }
}
