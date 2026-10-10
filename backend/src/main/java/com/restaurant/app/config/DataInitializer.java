package com.restaurant.app.config;

import com.restaurant.app.domain.entities.User;
import com.restaurant.app.domain.enums.Role;
import com.restaurant.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initOrUpdateUser("admin@gourmet.com", "Admin User", "admin123", Role.ADMIN);
        initOrUpdateUser("customer@gourmet.com", "Alice Customer", "customer123", Role.CUSTOMER);
    }

    private void initOrUpdateUser(String email, String name, String rawPassword, Role role) {
        userRepository.findByEmailIgnoreCase(email).ifPresentOrElse(user -> {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            userRepository.save(user);
            log.info("Initialized credentials for user: {} with role: {}", email, role);
        }, () -> {
            User newUser = User.builder()
                    .name(name)
                    .email(email.toLowerCase())
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .build();
            userRepository.save(newUser);
            log.info("Created default user: {} with role: {}", email, role);
        });
    }
}
