package com.restaurant.app.exception;

import com.restaurant.app.domain.enums.OrderStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(OrderStatus currentStatus, OrderStatus targetStatus) {
        super(String.format("Invalid order status transition from '%s' to '%s'", currentStatus, targetStatus));
    }

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
