package com.restaurant.app.repository;

import com.restaurant.app.domain.entities.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryId(Long categoryId);
    List<MenuItem> findByAvailableTrue();
    List<MenuItem> findByCategoryIdAndAvailableTrue(Long categoryId);
}
