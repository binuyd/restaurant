package com.restaurant.app.domain;

import com.restaurant.app.domain.enums.OrderStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

class OrderStatusTest {

    @Test
    @DisplayName("PLACED state allows transitioning to CONFIRMED and CANCELLED")
    void testPlacedStateTransitions() {
        assertTrue(OrderStatus.PLACED.canTransitionTo(OrderStatus.CONFIRMED));
        assertTrue(OrderStatus.PLACED.canTransitionTo(OrderStatus.CANCELLED));

        assertFalse(OrderStatus.PLACED.canTransitionTo(OrderStatus.PREPARING));
        assertFalse(OrderStatus.PLACED.canTransitionTo(OrderStatus.READY));
        assertFalse(OrderStatus.PLACED.canTransitionTo(OrderStatus.COMPLETED));
    }

    @Test
    @DisplayName("CONFIRMED state allows transitioning to PREPARING and CANCELLED")
    void testConfirmedStateTransitions() {
        assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PREPARING));
        assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.CANCELLED));

        assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.READY));
        assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.COMPLETED));
        assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PLACED));
    }

    @Test
    @DisplayName("PREPARING state allows transitioning ONLY to READY (cancellation forbidden)")
    void testPreparingStateTransitions() {
        assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.READY));

        assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CANCELLED), "Cancellation should not be allowed once preparing!");
        assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.COMPLETED));
        assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CONFIRMED));
    }

    @Test
    @DisplayName("READY state allows transitioning ONLY to COMPLETED")
    void testReadyStateTransitions() {
        assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.COMPLETED));

        assertFalse(OrderStatus.READY.canTransitionTo(OrderStatus.CANCELLED));
        assertFalse(OrderStatus.READY.canTransitionTo(OrderStatus.PREPARING));
    }

    @ParameterizedTest
    @CsvSource({
        "COMPLETED, PLACED",
        "COMPLETED, CONFIRMED",
        "COMPLETED, PREPARING",
        "COMPLETED, READY",
        "COMPLETED, CANCELLED",
        "CANCELLED, PLACED",
        "CANCELLED, CONFIRMED",
        "CANCELLED, PREPARING",
        "CANCELLED, READY",
        "CANCELLED, COMPLETED"
    })
    @DisplayName("Terminal states (COMPLETED, CANCELLED) allow no further transitions")
    void testTerminalStatesCannotTransition(OrderStatus source, OrderStatus target) {
        assertFalse(source.canTransitionTo(target));
    }
}
