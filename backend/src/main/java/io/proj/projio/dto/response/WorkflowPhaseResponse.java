package io.proj.projio.dto.response;

import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowPhaseResponse {

    private Long id;
    private String name;
    private String description;
    private WorkflowStatus status;
    private Integer phaseOrder;
    private String guidance;
    private String expectedOutcome;
    private String completionCriteria;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<WorkflowTaskResponse> tasks = Collections.emptyList();

    /** Backward-compatible factory — returns the phase with an empty task list. */
    public static WorkflowPhaseResponse from(WorkflowPhase phase) {
        return from(phase, Collections.emptyList());
    }

    /** Full factory — use this when tasks have been pre-fetched. */
    public static WorkflowPhaseResponse from(WorkflowPhase phase, List<WorkflowTaskResponse> tasks) {
        return WorkflowPhaseResponse.builder()
                .id(phase.getId())
                .name(phase.getName())
                .description(phase.getDescription())
                .status(phase.getStatus())
                .phaseOrder(phase.getPhaseOrder())
                .guidance(phase.getGuidance())
                .expectedOutcome(phase.getExpectedOutcome())
                .completionCriteria(phase.getCompletionCriteria())
                .createdAt(phase.getCreatedAt())
                .updatedAt(phase.getUpdatedAt())
                .tasks(tasks)
                .build();
    }
}


