package io.proj.projio.dto.request;

import io.proj.projio.enums.WorkflowStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowPhaseRequest {

    @NotNull(message = "Status is required")
    private WorkflowStatus status;
}
