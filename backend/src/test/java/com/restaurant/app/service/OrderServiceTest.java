package com.restaurant.app.service;

import com.restaurant.app.domain.entities.*;
import com.restaurant.app.domain.enums.OrderStatus;
import com.restaurant.app.domain.enums.Role;
import com.restaurant.app.dto.OrderDtos.*;
import com.restaurant.app.exception.InvalidStatusTransitionException;
import com.restaurant.app.exception.UnauthorizedAccessException;
import com.restaurant.app.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private MenuItem testItem1;
    private MenuItem testItem2;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .role(Role.CUSTOMER)
                .build();

        Category category = Category.builder().id(1L).name("Mains").build();

        testItem1 = MenuItem.builder()
                .id(10L)
                .category(category)
                .name("Burger")
                .price(new BigDecimal("15.00"))
                .available(true)
                .build();

        testItem2 = MenuItem.builder()
                .id(11L)
                .category(category)
                .name("Fries")
                .price(new BigDecimal("5.00"))
                .available(true)
                .build();
    }

    @Test
    @DisplayName("createOrder creates order with price snapshots and correct total amount")
    void testCreateOrder_Success() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .items(List.of(
                        new OrderItemRequest(10L, 2),
                        new OrderItemRequest(11L, 1)
                ))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(menuItemRepository.findAllById(Set.of(10L, 11L))).thenReturn(List.of(testItem1, testItem2));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(100L);
            return o;
        });

        OrderDto result = orderService.createOrder(1L, request);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(new BigDecimal("35.00"), result.getTotalAmount()); // 2*15 + 1*5 = 35.00
        assertEquals(OrderStatus.PLACED, result.getStatus());
        assertEquals(2, result.getItems().size());

        // Verify price snapshots
        assertEquals(new BigDecimal("15.00"), result.getItems().get(0).getUnitPrice());
        assertEquals(new BigDecimal("5.00"), result.getItems().get(1).getUnitPrice());

        verify(orderStatusHistoryRepository, times(1)).save(any(OrderStatusHistory.class));
    }

    @Test
    @DisplayName("updateStatus with legal transition (PLACED -> CONFIRMED) updates order and audit log")
    void testUpdateStatus_ValidTransition() {
        Order existingOrder = Order.builder()
                .id(100L)
                .user(testUser)
                .status(OrderStatus.PLACED)
                .totalAmount(new BigDecimal("35.00"))
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(existingOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);

        OrderDto updated = orderService.updateStatus(100L, OrderStatus.CONFIRMED, "admin@gourmet.com");

        assertEquals(OrderStatus.CONFIRMED, updated.getStatus());
        verify(orderStatusHistoryRepository, times(1)).save(any(OrderStatusHistory.class));
    }

    @Test
    @DisplayName("updateStatus with illegal transition (PLACED -> PREPARING) throws InvalidStatusTransitionException")
    void testUpdateStatus_InvalidTransition_ThrowsException() {
        Order existingOrder = Order.builder()
                .id(100L)
                .user(testUser)
                .status(OrderStatus.PLACED)
                .totalAmount(new BigDecimal("35.00"))
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(existingOrder));

        InvalidStatusTransitionException ex = assertThrows(InvalidStatusTransitionException.class, () ->
                orderService.updateStatus(100L, OrderStatus.PREPARING, "admin@gourmet.com")
        );

        assertTrue(ex.getMessage().contains("Invalid order status transition from 'PLACED' to 'PREPARING'"));
        verify(orderStatusHistoryRepository, never()).save(any(OrderStatusHistory.class));
    }

    @Test
    @DisplayName("cancelOrder fails if customer attempts to cancel another user's order")
    void testCancelOrder_UnauthorizedCustomer_ThrowsException() {
        User otherUser = User.builder().id(2L).name("Jane").email("jane@example.com").build();
        Order existingOrder = Order.builder()
                .id(100L)
                .user(otherUser)
                .status(OrderStatus.PLACED)
                .build();

        when(orderRepository.findById(100L)).thenReturn(Optional.of(existingOrder));

        assertThrows(UnauthorizedAccessException.class, () ->
                orderService.cancelOrder(100L, 1L, "john@example.com")
        );
    }
}
