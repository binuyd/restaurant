package com.restaurant.app.repository;

import com.restaurant.app.domain.entities.Order;
import com.restaurant.app.domain.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findAllByOrderByCreatedAtDesc();

    // Section 6: Dashboard Aggregation Queries
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :startDate AND o.status != 'CANCELLED'")
    BigDecimal calculateTotalRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate")
    long countOrdersSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT o.status as status, COUNT(o) as count FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersGroupedByStatus();

    @Query("SELECT oi.menuItem.id as menuItemId, oi.menuItem.name as name, SUM(oi.quantity) as totalQuantity, SUM(oi.unitPrice * oi.quantity) as totalSales " +
           "FROM OrderItem oi JOIN oi.order o WHERE o.status != 'CANCELLED' " +
           "GROUP BY oi.menuItem.id, oi.menuItem.name ORDER BY totalQuantity DESC")
    List<Object[]> findTopSellingItems();
}
