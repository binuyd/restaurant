package com.restaurant.app.repository;

import com.restaurant.app.domain.entities.Reservation;
import com.restaurant.app.domain.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserIdOrderByReservationDateDescReservationTimeDesc(Long userId);
    List<Reservation> findByReservationDateOrderByReservationTimeAsc(LocalDate reservationDate);
    List<Reservation> findByStatusOrderByReservationDateDescReservationTimeDesc(ReservationStatus status);
    List<Reservation> findAllByOrderByReservationDateDescReservationTimeDesc();
}
