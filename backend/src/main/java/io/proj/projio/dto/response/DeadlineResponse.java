package io.proj.projio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Response DTO for the {@code GET /api/v1/deadlines} endpoint.
 *
 * <p>Represents a single task deadline entry. {@code projectId} and
 * {@code projectTitle} identify the parent project the task belongs to.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeadlineResponse {

    /**
     * Primary key of the task.
     */
    Long id;

    /**
     * Human-readable title of the task.
     */
    String title;

    /**
     * The due date of the task.
     */
    LocalDate deadline;

    /**
     * ID of the parent project.
     */
    Long projectId;

    /**
     * Title of the parent project.
     */
    String projectTitle;

    /**
     * Number of deadline history records persisted for this task.
     * Computed as {@code COUNT(*)} over the {@code deadline_history} table.
     * Always reflects the true persisted count; never incremented client-side.
     */
    long extensionCount;
}
