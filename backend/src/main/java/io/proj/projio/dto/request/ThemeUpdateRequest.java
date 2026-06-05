package io.proj.projio.dto.request;

import io.proj.projio.enums.ThemeMode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThemeUpdateRequest {

    @NotNull(message = "Theme mode is required")
    private ThemeMode themeMode;
}
