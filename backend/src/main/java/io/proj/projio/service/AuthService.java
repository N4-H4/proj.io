package io.proj.projio.service;

import io.proj.projio.dto.request.LoginRequest;
import io.proj.projio.dto.request.SignupRequest;
import io.proj.projio.dto.response.AuthResponse;
import io.proj.projio.dto.response.UserResponse;
import io.proj.projio.entity.User;
import io.proj.projio.exception.DuplicateResourceException;
import io.proj.projio.exception.UnauthorizedException;
import io.proj.projio.repository.UserRepository;
import io.proj.projio.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());
        return AuthResponse.of(token, UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            String token = jwtTokenProvider.generateToken(authentication);
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

            return AuthResponse.of(token, UserResponse.from(user));
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }
}
