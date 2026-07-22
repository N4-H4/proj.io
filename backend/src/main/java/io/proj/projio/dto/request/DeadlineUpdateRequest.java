package io.proj.projio.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeadlineUpdateRequest {

    @NotNull(message = "Deadline date is required")
    @FutureOrPresent(message = "Deadline must be today or a future date")
    private LocalDate deadline;
}
