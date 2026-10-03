package com.restaurant.app.dto;

import com.restaurant.app.domain.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopSellingItemDto {
        private Long menuItemId;
        private String name;
        private Long totalQuantity;
        private BigDecimal totalSales;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardSummaryDto {
        private BigDecimal todayRevenue;
        private long todayOrderCount;
        private BigDecimal last7DaysRevenue;
        private long last7DaysOrderCount;
        private Map<OrderStatus, Long> ordersByStatus;
        private List<TopSellingItemDto> topSellingItems;
    }
}
