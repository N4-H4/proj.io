package io.proj.projio.dto.response;

import io.proj.projio.entity.User;
import io.proj.projio.enums.ThemeMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private ThemeMode themeMode;
    private Boolean firstLogin;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .themeMode(user.getThemeMode())
                .firstLogin(user.getFirstLogin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
