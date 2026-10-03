package com.restaurant.app.domain.enums;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PLACED,
    CONFIRMED,
    PREPARING,
    READY,
    COMPLETED,
    CANCELLED;

    /**
     * Defines legal state transitions for the order lifecycle.
     * PLACED -> CONFIRMED -> PREPARING -> READY -> COMPLETED
     * CANCELLED is allowed only from PLACED or CONFIRMED (before PREPARING).
     */
    public Set<OrderStatus> allowedNext() {
        return switch (this) {
            case PLACED -> EnumSet.of(CONFIRMED, CANCELLED);
            case CONFIRMED -> EnumSet.of(PREPARING, CANCELLED);
            case PREPARING -> EnumSet.of(READY);
            case READY -> EnumSet.of(COMPLETED);
            case COMPLETED, CANCELLED -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    public boolean canTransitionTo(OrderStatus target) {
        return allowedNext().contains(target);
    }
}
