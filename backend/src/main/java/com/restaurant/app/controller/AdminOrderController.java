package com.restaurant.app.controller;

import com.restaurant.app.domain.enums.OrderStatus;
import com.restaurant.app.dto.OrderDtos.*;
import com.restaurant.app.security.UserPrincipal;
import com.restaurant.app.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Order Board", description = "Admin endpoints for order management and state machine status transitions")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders with optional status filtering")
    public ResponseEntity<List<OrderDto>> getOrders(@RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.getAllOrders(status));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status (Enforces legal state machine transitions & audit logging)")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto response = orderService.updateStatus(id, request.getStatus(), userPrincipal.getEmail());
        return ResponseEntity.ok(response);
    }
}
