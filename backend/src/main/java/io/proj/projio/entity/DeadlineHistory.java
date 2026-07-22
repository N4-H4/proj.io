package io.proj.projio.entity;

import io.proj.projio.enums.DeadlineAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Audit record capturing every meaningful change to a task's due date.
 *
 * <p>A "deadline" in this system is a {@link Task} whose {@code dueDate} is non-null.
 * Because there is no separate Deadline entity, history is relationally anchored to
 * {@link Task} via a {@code @ManyToOne} association.
 *
 * <p>Records are immutable after insertion — no update path exists.
 */
@Entity
@Table(name = "deadline_history", indexes = {
        @Index(name = "idx_deadline_history_task_id",    columnList = "task_id"),
        @Index(name = "idx_deadline_history_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeadlineHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The task whose due date changed. Loaded lazily to avoid N+1 on list queries.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    /**
     * The type of change ({@code DEADLINE_SET} or {@code DEADLINE_RESCHEDULED}).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeadlineAction action;

    /**
     * ISO-8601 date string of the previous due date, or {@code null} when the due
     * date was set for the first time.
     */
    @Column(name = "previous_value", length = 20)
    private String previousValue;

    /**
     * ISO-8601 date string of the new due date. Never null.
     */
    @Column(name = "new_value", nullable = false, length = 20)
    private String newValue;

    /**
     * Email of the authenticated user who triggered the change. Nullable to
     * accommodate system-initiated mutations (e.g., batch jobs).
     */
    @Column(name = "changed_by", length = 255)
    private String changedBy;

    /**
     * Timestamp set automatically by Hibernate on insert.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
