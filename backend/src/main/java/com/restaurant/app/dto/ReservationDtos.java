package com.restaurant.app.dto;

import com.restaurant.app.domain.enums.ReservationStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateReservationRequest {
        @NotBlank(message = "Guest name is required")
        private String guestName;

        @NotBlank(message = "Guest email is required")
        private String guestEmail;

        @NotBlank(message = "Guest phone is required")
        private String guestPhone;

        @NotNull(message = "Reservation date is required")
        private LocalDate reservationDate;

        @NotBlank(message = "Reservation time slot is required")
        private String reservationTime;

        @NotNull(message = "Party size is required")
        @Min(value = 1, message = "Party size must be at least 1 person")
        private Integer partySize;

        private String seatingArea;
        private String specialOccasion;
        private String specialRequests;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReservationDto {
        private Long id;
        private Long userId;
        private String guestName;
        private String guestEmail;
        private String guestPhone;
        private LocalDate reservationDate;
        private String reservationTime;
        private Integer partySize;
        private String seatingArea;
        private String specialOccasion;
        private String specialRequests;
        private ReservationStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateReservationStatusRequest {
        @NotNull(message = "Status is required")
        private ReservationStatus status;
    }
}
