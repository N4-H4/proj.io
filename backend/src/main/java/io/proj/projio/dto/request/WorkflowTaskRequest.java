package io.proj.projio.dto.request;

import io.proj.projio.enums.WorkflowTaskStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for WorkflowTask create (POST) and partial update (PATCH).
 *
 * <h3>POST /api/v1/workflow-tasks</h3>
 * Required: {@code phaseId}, {@code title}, {@code criterionIndex}.
 * Optional: {@code description} (AI-reserved), {@code status} (defaults to {@code TODO}).
 *
 * <h3>PATCH /api/v1/workflow-tasks/{id}</h3>
 * All fields are optional; at least one of {@code title}, {@code status},
 * or {@code completed} must be present. The service reconciles {@code completed}
 * → {@code status} for frontend backward-compatibility.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTaskRequest {

    /** Required for POST. Null is acceptable on PATCH (task identity comes from path). */
    private Long phaseId;

    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    /**
     * Optional implementation notes. Nullable; ignored on MVP manual creation.
     * Reserved for future AI task injection.
     */
    @Size(max = 4000, message = "Description must be at most 4000 characters")
    private String description;

    /**
     * Preferred way to set task status from the service layer or future AI clients.
     * Accepts {@code "TODO"} or {@code "DONE"}.
     */
    private WorkflowTaskStatus status;

    /**
     * Legacy boolean toggle for frontend backward-compatibility.
     *
     * <p>When present on a PATCH and {@code status} is null, the service maps:
     * {@code true} → {@link WorkflowTaskStatus#DONE}, {@code false} → {@link WorkflowTaskStatus#TODO}.
     * If both {@code status} and {@code completed} are provided, {@code status} takes precedence.
     */
    private Boolean completed;

    /**
     * Index of the acceptance criterion this task belongs to.
     * Required on POST. Accepted values:
     * <ul>
     *   <li>{@code -1} — the virtual "General" criterion (informational housekeeping;
     *       never prevents phase completion)</li>
     *   <li>Any valid 0-based index into the parent phase's
     *       {@code completionCriteria} newline-split list</li>
     * </ul>
     * The backend returns HTTP 400 if this is null or outside the accepted range.
     */
    private Integer criterionIndex;
}
