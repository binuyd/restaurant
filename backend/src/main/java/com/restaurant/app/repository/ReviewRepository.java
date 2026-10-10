package com.restaurant.app.repository;

import com.restaurant.app.domain.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMenuItemIdOrderByCreatedAtDesc(Long menuItemId);

    @Query("SELECT r.menuItem.id, AVG(r.rating), COUNT(r.id) FROM Review r GROUP BY r.menuItem.id")
    List<Object[]> findRatingSummaries();
}
