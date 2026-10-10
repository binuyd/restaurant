package com.restaurant.app.service;

import com.restaurant.app.domain.entities.*;
import com.restaurant.app.domain.enums.OrderStatus;
import com.restaurant.app.dto.OrderDtos.*;
import com.restaurant.app.exception.BadRequestException;
import com.restaurant.app.exception.InvalidStatusTransitionException;
import com.restaurant.app.exception.ResourceNotFoundException;
import com.restaurant.app.exception.UnauthorizedAccessException;
import com.restaurant.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order items list cannot be empty");
        }

        // Fetch all requested menu items to calculate server-side prices (Never trust client prices!)
        Set<Long> menuItemIds = request.getItems().stream()
                .map(OrderItemRequest::getMenuItemId)
                .collect(Collectors.toSet());

        Map<Long, MenuItem> menuItemMap = menuItemRepository.findAllById(menuItemIds).stream()
                .collect(Collectors.toMap(MenuItem::getId, item -> item));

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PLACED)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() < 1) {
                throw new BadRequestException("Each order item quantity must be at least 1");
            }
            MenuItem menuItem = menuItemMap.get(itemReq.getMenuItemId());
            if (menuItem == null) {
                throw new ResourceNotFoundException("MenuItem", "id", itemReq.getMenuItemId());
            }
            if (Boolean.FALSE.equals(menuItem.getAvailable())) {
                throw new BadRequestException("Menu item '" + menuItem.getName() + "' is currently unavailable");
            }

            BigDecimal unitPriceSnapshot = menuItem.getPrice();
            BigDecimal itemTotal = unitPriceSnapshot.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            grandTotal = grandTotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPriceSnapshot) // Price snapshot!
                    .build();

            order.addItem(orderItem);
        }

        order.setTotalAmount(grandTotal);
        Order savedOrder = orderRepository.save(order);

        // Record initial status history audit log
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .fromStatus(null)
                .toStatus(OrderStatus.PLACED)
                .changedBy(user.getEmail())
                .build();
        orderStatusHistoryRepository.save(history);

        return mapToDto(savedOrder);
    }

    /**
     * Core Order Lifecycle State Machine Transition Handler.
     * Enforces legal transitions, optimistic locking (@Version), and audit trail history.
     */
    @Transactional
    public OrderDto updateStatus(Long orderId, OrderStatus targetStatus, String actor) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus currentStatus = order.getStatus();

        // Validate state machine transition logic
        if (!currentStatus.canTransitionTo(targetStatus)) {
            throw new InvalidStatusTransitionException(currentStatus, targetStatus);
        }

        // Apply new status
        order.setStatus(targetStatus);
        Order updatedOrder = orderRepository.save(order);

        // Save status history audit log
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(updatedOrder)
                .fromStatus(currentStatus)
                .toStatus(targetStatus)
                .changedBy(actor)
                .build();
        orderStatusHistoryRepository.save(history);

        return mapToDto(updatedOrder);
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, Long userId, String actorEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You can only cancel your own orders");
        }

        return updateStatus(orderId, OrderStatus.CANCELLED, actorEmail);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, Long requestingUserId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!isAdmin && !order.getUser().getId().equals(requestingUserId)) {
            throw new UnauthorizedAccessException("You are not authorized to view this order");
        }

        return mapToDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders(OrderStatus status) {
        List<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private OrderDto mapToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream().map(item ->
                OrderItemDto.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build()
        ).collect(Collectors.toList());

        List<OrderStatusHistoryDto> historyDtos = orderStatusHistoryRepository
                .findByOrderIdOrderByChangedAtAsc(order.getId()).stream()
                .map(h -> OrderStatusHistoryDto.builder()
                        .id(h.getId())
                        .fromStatus(h.getFromStatus())
                        .toStatus(h.getToStatus())
                        .changedBy(h.getChangedBy())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .customerName(order.getUser().getName())
                .customerEmail(order.getUser().getEmail())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .version(order.getVersion())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemDtos)
                .statusHistory(historyDtos)
                .build();
    }
}
