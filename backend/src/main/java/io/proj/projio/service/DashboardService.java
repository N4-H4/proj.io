package io.proj.projio.service;

import io.proj.projio.dto.response.DashboardStatsResponse;
import io.proj.projio.entity.ActivityLog;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.Task;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.ProjectStatus;
import io.proj.projio.enums.TaskStatus;
import io.proj.projio.repository.ActivityLogRepository;
import io.proj.projio.repository.ProjectRepository;
import io.proj.projio.repository.TaskRepository;
import io.proj.projio.repository.WorkflowPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkflowPhaseRepository workflowPhaseRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserService userService;

    public DashboardStatsResponse getStats() {
        Long userId = userService.getCurrentUserId();
        LocalDate today = LocalDate.now();

        // ── Project stats ──
        long totalProjects = projectRepository.countByUserId(userId);
        long activeProjects = projectRepository.countByUserIdAndStatus(userId, ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByUserIdAndStatus(userId, ProjectStatus.COMPLETED);
        long archivedProjects = projectRepository.countByUserIdAndArchived(userId, true);

        // ── Task stats ──
        long totalTasks = taskRepository.countByUserId(userId);
        long pendingTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO);
        long inProgressTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long completedTasks = taskRepository.countByUserIdAndStatus(userId, TaskStatus.DONE);

        // ── Time-scoped completion stats ──
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfWeek = today.with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();

        long tasksCompletedToday = taskRepository.countCompletedByUserSince(userId, startOfToday);
        long tasksCompletedThisWeek = taskRepository.countCompletedByUserSince(userId, startOfWeek);
        long tasksCompletedThisMonth = taskRepository.countCompletedByUserSince(userId, startOfMonth);

        // ── Continue Building — most recently updated active project ──
        DashboardStatsResponse.ContinueProjectItem continueProject = null;
        Optional<Project> activeProject = projectRepository
                .findFirstByUserIdAndStatusAndArchivedFalseOrderByUpdatedAtDesc(userId, ProjectStatus.IN_PROGRESS);

        Long continueProjectId = null;
        if (activeProject.isPresent()) {
            Project p = activeProject.get();
            continueProjectId = p.getId();

            int progress = p.getProgress() != null ? p.getProgress() : 0;

            Long daysRemaining = p.getDeadline() != null
                    ? ChronoUnit.DAYS.between(today, p.getDeadline())
                    : null;

            continueProject = DashboardStatsResponse.ContinueProjectItem.builder()
                    .id(p.getId())
                    .title(p.getTitle())
                    .domain(p.getDomain())
                    .status(p.getStatus().name())
                    .progress(progress)
                    .deadline(p.getDeadline())
                    .daysRemaining(daysRemaining)
                    .updatedAt(p.getUpdatedAt())
                    .build();
        }

        // ── Next Up — nearest TODO tasks ──
        List<Task> allUserTasks = taskRepository.findAllByUserIdAndStatus(userId, TaskStatus.TODO);
        List<DashboardStatsResponse.NextUpTaskItem> nextUpTasks = allUserTasks.stream()
                .sorted(Comparator
                        .comparing((Task t) -> t.getDueDate() == null ? LocalDate.MAX : t.getDueDate())
                        .thenComparing(t -> t.getPriority().ordinal()))
                .limit(5)
                .map(t -> {
                    Long daysRem = t.getDueDate() != null
                            ? ChronoUnit.DAYS.between(today, t.getDueDate())
                            : null;
                    return DashboardStatsResponse.NextUpTaskItem.builder()
                            .id(t.getId())
                            .title(t.getTitle())
                            .projectId(t.getProject().getId())
                            .projectTitle(t.getProject().getTitle())
                            .priority(t.getPriority().name())
                            .dueDate(t.getDueDate())
                            .daysRemaining(daysRem)
                            .build();
                })
                .collect(Collectors.toList());

        // ── Deadline Watch ──
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
                    .status(p.getStatus().name())
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
                    .status(t.getStatus().name())
                    .build());
        }

        deadlineItems.sort(Comparator.comparing(DashboardStatsResponse.DeadlineItem::getDeadline));
        if (deadlineItems.size() > 10) {
            deadlineItems = deadlineItems.subList(0, 10);
        }

        // ── Project Journal — recent activity ──
        List<ActivityLog> logs = activityLogRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 10));
        List<DashboardStatsResponse.ActivityItem> recentActivity = logs.stream()
                .map(log -> DashboardStatsResponse.ActivityItem.builder()
                        .id(log.getId())
                        .action(log.getAction())
                        .entityType(log.getEntityType())
                        .title(log.getTitle())
                        .projectTitle(log.getProjectTitle())
                        .projectId(log.getProjectId())
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // ── Development Journey — workflow phases for active project ──
        List<DashboardStatsResponse.WorkflowJourneyItem> workflowJourney = new ArrayList<>();
        if (continueProjectId != null) {
            List<WorkflowPhase> phases = workflowPhaseRepository
                    .findByProjectIdOrderByPhaseOrderAsc(continueProjectId);
            workflowJourney = phases.stream()
                    .map(ph -> DashboardStatsResponse.WorkflowJourneyItem.builder()
                            .phaseOrder(ph.getPhaseOrder())
                            .name(ph.getName())
                            .status(ph.getStatus().name())
                            .build())
                    .collect(Collectors.toList());
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
                .tasksCompletedToday(tasksCompletedToday)
                .tasksCompletedThisWeek(tasksCompletedThisWeek)
                .tasksCompletedThisMonth(tasksCompletedThisMonth)
                .continueProject(continueProject)
                .nextUpTasks(nextUpTasks)
                .upcomingDeadlines(deadlineItems)
                .recentActivity(recentActivity)
                .workflowJourney(workflowJourney)
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
                        .status(p.getStatus().name())
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
                        .status(t.getStatus().name())
                        .build());
            }
        }

        deadlineItems.sort(Comparator.comparing(DashboardStatsResponse.DeadlineItem::getDeadline));
        return deadlineItems;
    }
}
