package io.proj.projio.service;

import io.proj.projio.dto.request.ThemeUpdateRequest;
import io.proj.projio.dto.response.UserResponse;
import io.proj.projio.entity.User;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public UserResponse getCurrentUserProfile() {
        return UserResponse.from(getCurrentUser());
    }

    @Transactional
    public UserResponse updateName(String name) {
        User user = getCurrentUser();
        user.setName(name);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateTheme(ThemeUpdateRequest request) {
        User user = getCurrentUser();
        user.setThemeMode(request.getThemeMode());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse markWelcomeSeen() {
        User user = getCurrentUser();
        user.setFirstLogin(false);
        return UserResponse.from(userRepository.save(user));
    }
}
