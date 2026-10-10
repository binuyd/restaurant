package com.restaurant.app.service;

import com.restaurant.app.domain.entities.Reservation;
import com.restaurant.app.domain.entities.User;
import com.restaurant.app.domain.enums.ReservationStatus;
import com.restaurant.app.dto.ReservationDtos.*;
import com.restaurant.app.exception.ResourceNotFoundException;
import com.restaurant.app.exception.UnauthorizedAccessException;
import com.restaurant.app.repository.ReservationRepository;
import com.restaurant.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReservationDto createReservation(Long userId, CreateReservationRequest request) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .guestName(request.getGuestName())
                .guestEmail(request.getGuestEmail())
                .guestPhone(request.getGuestPhone())
                .reservationDate(request.getReservationDate())
                .reservationTime(request.getReservationTime())
                .partySize(request.getPartySize())
                .seatingArea(request.getSeatingArea() != null ? request.getSeatingArea() : "MAIN_DINING")
                .specialOccasion(request.getSpecialOccasion() != null ? request.getSpecialOccasion() : "CASUAL")
                .specialRequests(request.getSpecialRequests())
                .status(ReservationStatus.CONFIRMED)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByReservationDateDescReservationTimeDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getAllReservations(LocalDate date, ReservationStatus status) {
        List<Reservation> list;
        if (date != null) {
            list = reservationRepository.findByReservationDateOrderByReservationTimeAsc(date);
        } else if (status != null) {
            list = reservationRepository.findByStatusOrderByReservationDateDescReservationTimeDesc(status);
        } else {
            list = reservationRepository.findAllByOrderByReservationDateDescReservationTimeDesc();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ReservationDto updateReservationStatus(Long reservationId, ReservationStatus newStatus) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));
        reservation.setStatus(newStatus);
        return mapToDto(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationDto cancelReservation(Long reservationId, Long userId, boolean isAdmin) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if (!isAdmin) {
            if (reservation.getUser() == null || !reservation.getUser().getId().equals(userId)) {
                throw new UnauthorizedAccessException("You are not authorized to cancel this reservation");
            }
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        return mapToDto(reservationRepository.save(reservation));
    }

    private ReservationDto mapToDto(Reservation r) {
        return ReservationDto.builder()
                .id(r.getId())
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .guestName(r.getGuestName())
                .guestEmail(r.getGuestEmail())
                .guestPhone(r.getGuestPhone())
                .reservationDate(r.getReservationDate())
                .reservationTime(r.getReservationTime())
                .partySize(r.getPartySize())
                .seatingArea(r.getSeatingArea())
                .specialOccasion(r.getSpecialOccasion())
                .specialRequests(r.getSpecialRequests())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
