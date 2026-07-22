package io.proj.projio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for {@code GET /api/v1/deadlines/{id}/history}.
 *
 * <p>Exposes only serialisable fields; the {@link io.proj.projio.entity.DeadlineHistory}
 * entity is never returned directly.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeadlineHistoryResponse {

    /**
     * Primary key of this history record.
     */
    private Long id;

    /**
     * ID of the task whose due date changed.
     */
    private Long taskId;

    /**
     * The type of change that was recorded (e.g., {@code "DEADLINE_SET"}).
     */
    private String action;

    /**
     * ISO-8601 date string of the prior due date; {@code null} when the deadline
     * was assigned for the first time.
     */
    private String previousValue;

    /**
     * ISO-8601 date string of the new due date.
     */
    private String newValue;

    /**
     * Email of the user who made the change; may be {@code null} for system events.
     */
    private String changedBy;

    /**
     * Timestamp when this history record was persisted.
     */
    private LocalDateTime createdAt;
}
