package io.proj.projio.entity;

import io.proj.projio.enums.WorkflowTaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_tasks", indexes = {
        @Index(name = "idx_workflow_task_phase_id", columnList = "phase_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", nullable = false)
    private WorkflowPhase workflowPhase;

    @Column(nullable = false, length = 200)
    private String title;

    /**
     * Optional implementation notes for this task.
     *
     * <p>Nullable and not required by the frontend for MVP manual creation.
     * Reserved for future AI-generated tasks that will inject structured
     * implementation guidance here.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Lifecycle status of the task.
     *
     * <p>MVP values: {@link WorkflowTaskStatus#TODO} (unchecked) and
     * {@link WorkflowTaskStatus#DONE} (checked). The response DTO also
     * derives a {@code completed} boolean from this field for frontend
     * backward-compatibility.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private WorkflowTaskStatus status = WorkflowTaskStatus.TODO;

    @Column(name = "task_order", nullable = false)
    private Integer taskOrder;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
