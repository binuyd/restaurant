package com.restaurant.app.controller;

import com.restaurant.app.dto.MenuDtos.*;
import com.restaurant.app.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/menu-items")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Menu Management", description = "Admin endpoints for creating, updating, and deleting menu items")
public class AdminMenuController {

    private final MenuService menuService;

    @PostMapping
    @Operation(summary = "Create a new menu item")
    public ResponseEntity<MenuItemDto> createMenuItem(@Valid @RequestBody MenuItemCreateRequest request) {
        MenuItemDto response = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing menu item")
    public ResponseEntity<MenuItemDto> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemUpdateRequest request) {
        MenuItemDto response = menuService.updateMenuItem(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a menu item by ID")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
