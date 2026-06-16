package io.proj.projio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    // Project stats
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long archivedProjects;

    // Task stats
    private long totalTasks;
    private long pendingTasks;
    private long inProgressTasks;
    private long completedTasks;

    // Time-scoped task completion stats
    private long tasksCompletedToday;
    private long tasksCompletedThisWeek;
    private long tasksCompletedThisMonth;

    // Continue Building — most recently active project
    private ContinueProjectItem continueProject;

    // Next Up — nearest TODO tasks
    private List<NextUpTaskItem> nextUpTasks;

    // Deadline Watch
    private List<DeadlineItem> upcomingDeadlines;

    // Project Journal — recent activity
    private List<ActivityItem> recentActivity;

    // Development Journey — workflow phases for active project
    private List<WorkflowJourneyItem> workflowJourney;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeadlineItem {
        private String type; // "PROJECT" or "TASK"
        private Long id;
        private String title;
        private LocalDate deadline;
        private String projectTitle;
        private long daysRemaining;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContinueProjectItem {
        private Long id;
        private String title;
        private String domain;
        private String status;
        private int progress;
        private LocalDate deadline;
        private Long daysRemaining;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NextUpTaskItem {
        private Long id;
        private String title;
        private Long projectId;
        private String projectTitle;
        private String priority;
        private LocalDate dueDate;
        private Long daysRemaining;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityItem {
        private Long id;
        private String action;
        private String entityType;
        private String title;
        private String projectTitle;
        private Long projectId;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkflowJourneyItem {
        private int phaseOrder;
        private String name;
        private String status;
    }
}
