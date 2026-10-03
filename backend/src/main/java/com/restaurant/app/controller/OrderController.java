package com.restaurant.app.controller;

import com.restaurant.app.dto.OrderDtos.*;
import com.restaurant.app.security.UserPrincipal;
import com.restaurant.app.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Customer Orders", description = "Endpoints for customer order placement, tracking, and cancellation")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order with auto-calculated total & price snapshots")
    public ResponseEntity<OrderDto> createOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto response = orderService.createOrder(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @Operation(summary = "Get current authenticated customer's orders history")
    public ResponseEntity<List<OrderDto>> getMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(orderService.getUserOrders(userPrincipal.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific order details (restricted to owner or admin)")
    public ResponseEntity<OrderDto> getOrderById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getOrderById(id, userPrincipal.getId(), isAdmin));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order (Allowed only before PREPARING status)")
    public ResponseEntity<OrderDto> cancelOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        OrderDto response = orderService.cancelOrder(id, userPrincipal.getId(), userPrincipal.getEmail());
        return ResponseEntity.ok(response);
    }
}
