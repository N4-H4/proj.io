package io.proj.projio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long archivedProjects;
    private long totalTasks;
    private long pendingTasks;
    private long inProgressTasks;
    private long completedTasks;
    private List<DeadlineItem> upcomingDeadlines;

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
    }
}
