package com.restaurant.app.controller;

import com.restaurant.app.domain.enums.ReservationStatus;
import com.restaurant.app.dto.ReservationDtos.*;
import com.restaurant.app.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Reservations", description = "Admin endpoints for table bookings management")
public class AdminReservationController {

    private final ReservationService reservationService;

    @GetMapping
    @Operation(summary = "Get all restaurant reservations with optional filters")
    public ResponseEntity<List<ReservationDto>> getAllReservations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) ReservationStatus status) {
        return ResponseEntity.ok(reservationService.getAllReservations(date, status));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status of a table reservation (CONFIRMED, SEATED, COMPLETED, CANCELLED)")
    public ResponseEntity<ReservationDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationStatusRequest request) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, request.getStatus()));
    }
}
