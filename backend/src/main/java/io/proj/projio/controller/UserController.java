package io.proj.projio.controller;

import io.proj.projio.dto.request.ThemeUpdateRequest;
import io.proj.projio.dto.response.UserResponse;
import io.proj.projio.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        return ResponseEntity.ok(userService.updateName(name));
    }

    @PutMapping("/me/theme")
    public ResponseEntity<UserResponse> updateTheme(@Valid @RequestBody ThemeUpdateRequest request) {
        return ResponseEntity.ok(userService.updateTheme(request));
    }

    @PutMapping("/me/welcome")
    public ResponseEntity<UserResponse> markWelcomeSeen() {
        return ResponseEntity.ok(userService.markWelcomeSeen());
    }
}
