package io.proj.projio.dto.response;

import io.proj.projio.entity.WorkflowTask;
import io.proj.projio.enums.WorkflowTaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload for a {@link WorkflowTask}.
 *
 * <h3>Backward-compatibility bridge</h3>
 * The {@code completed} field is derived from {@code status} so that
 * frontend code relying on the boolean field continues to work without modification:
 * <ul>
 *   <li>{@link WorkflowTaskStatus#DONE} → {@code completed = true}</li>
 *   <li>{@link WorkflowTaskStatus#TODO} → {@code completed = false}</li>
 * </ul>
 * Future consumers should prefer {@code status} directly.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTaskResponse {

    private Long id;
    private Long phaseId;
    private String title;

    /**
     * Optional implementation notes. Null for all MVP manually-created tasks.
     * Will be populated by future AI task-generation features.
     */
    private String description;

    /** Lifecycle status. MVP values: {@code TODO} or {@code DONE}. */
    private WorkflowTaskStatus status;

    /**
     * Derived boolean for frontend backward-compatibility.
     * {@code true} when {@code status == DONE}, {@code false} otherwise.
     */
    private Boolean completed;

    private Integer taskOrder;

    public static WorkflowTaskResponse from(WorkflowTask task) {
        WorkflowTaskStatus status = task.getStatus();
        return WorkflowTaskResponse.builder()
                .id(task.getId())
                .phaseId(task.getWorkflowPhase().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(status)
                .completed(status == WorkflowTaskStatus.DONE)
                .taskOrder(task.getTaskOrder())
                .build();
    }
}
