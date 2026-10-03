package com.restaurant.app.service;

import com.restaurant.app.domain.enums.OrderStatus;
import com.restaurant.app.dto.DashboardDtos.*;
import com.restaurant.app.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfLast7Days = LocalDate.now().minusDays(6).atStartOfDay();

        BigDecimal todayRevenue = orderRepository.calculateTotalRevenueSince(startOfToday);
        long todayOrderCount = orderRepository.countOrdersSince(startOfToday);

        BigDecimal last7DaysRevenue = orderRepository.calculateTotalRevenueSince(startOfLast7Days);
        long last7DaysOrderCount = orderRepository.countOrdersSince(startOfLast7Days);

        // Map status counts
        Map<OrderStatus, Long> ordersByStatus = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, 0L);
        }

        List<Object[]> statusCounts = orderRepository.countOrdersGroupedByStatus();
        for (Object[] row : statusCounts) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];
            ordersByStatus.put(status, count);
        }

        // Top 5 selling items
        List<Object[]> topItemsRows = orderRepository.findTopSellingItems();
        List<TopSellingItemDto> topSellingItems = topItemsRows.stream()
                .limit(5)
                .map(row -> TopSellingItemDto.builder()
                        .menuItemId((Long) row[0])
                        .name((String) row[1])
                        .totalQuantity(((Number) row[2]).longValue())
                        .totalSales((BigDecimal) row[3])
                        .build())
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .todayOrderCount(todayOrderCount)
                .last7DaysRevenue(last7DaysRevenue != null ? last7DaysRevenue : BigDecimal.ZERO)
                .last7DaysOrderCount(last7DaysOrderCount)
                .ordersByStatus(ordersByStatus)
                .topSellingItems(topSellingItems)
                .build();
    }
}
