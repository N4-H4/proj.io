package io.proj.projio.dto.response;

import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorkflowPhaseResponse from(WorkflowPhase phase) {
        return WorkflowPhaseResponse.builder()
                .id(phase.getId())
                .name(phase.getName())
                .description(phase.getDescription())
                .status(phase.getStatus())
                .phaseOrder(phase.getPhaseOrder())
                .createdAt(phase.getCreatedAt())
                .updatedAt(phase.getUpdatedAt())
                .build();
    }
}
