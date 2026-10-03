package com.restaurant.app.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class MenuDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDto {
        private Long id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MenuItemDto {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private Boolean available;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MenuItemCreateRequest {
        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotBlank(message = "Name is required")
        @Size(max = 150)
        private String name;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal price;

        private String imageUrl;

        private Boolean available;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MenuItemUpdateRequest {
        private Long categoryId;

        @Size(max = 150)
        private String name;

        private String description;

        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal price;

        private String imageUrl;

        private Boolean available;
    }
}
