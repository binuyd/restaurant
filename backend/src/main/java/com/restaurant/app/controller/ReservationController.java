package com.restaurant.app.controller;

import com.restaurant.app.dto.ReservationDtos.*;
import com.restaurant.app.security.UserPrincipal;
import com.restaurant.app.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Table Reservations", description = "Endpoints for reserving dining tables and checking bookings")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @Operation(summary = "Create a table reservation (authenticated or guest)")
    public ResponseEntity<ReservationDto> createReservation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReservationRequest request) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        ReservationDto dto = reservationService.createReservation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/my")
    @Operation(summary = "Get reservations made by the currently logged-in user")
    public ResponseEntity<List<ReservationDto>> getMyReservations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(reservationService.getUserReservations(userPrincipal.getId()));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<ReservationDto> cancelReservation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(reservationService.cancelReservation(id, userPrincipal.getId(), isAdmin));
    }
}
