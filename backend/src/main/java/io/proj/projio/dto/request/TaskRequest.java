package io.proj.projio.dto.request;

import io.proj.projio.enums.TaskPriority;
import io.proj.projio.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    private String description;

    private LocalDate dueDate;

    private TaskPriority priority;

    private TaskStatus status;
}
