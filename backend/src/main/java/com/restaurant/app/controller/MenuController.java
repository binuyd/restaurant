package com.restaurant.app.controller;

import com.restaurant.app.dto.MenuDtos.*;
import com.restaurant.app.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@Tag(name = "Public Menu", description = "Endpoints for customer menu and category browsing")
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/categories")
    @Operation(summary = "Get all menu categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @GetMapping
    @Operation(summary = "Browse menu items with optional category filtering")
    public ResponseEntity<List<MenuItemDto>> getMenuItems(
            @RequestParam(required = false) Long category,
            @RequestParam(required = false, defaultValue = "true") Boolean availableOnly) {
        return ResponseEntity.ok(menuService.getMenuItems(category, availableOnly));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a specific menu item")
    public ResponseEntity<MenuItemDto> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuItemById(id));
    }
}
