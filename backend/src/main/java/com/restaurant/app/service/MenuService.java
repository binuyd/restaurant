package com.restaurant.app.service;

import com.restaurant.app.domain.entities.Category;
import com.restaurant.app.domain.entities.MenuItem;
import com.restaurant.app.dto.MenuDtos.*;
import com.restaurant.app.exception.ResourceNotFoundException;
import com.restaurant.app.repository.CategoryRepository;
import com.restaurant.app.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDto.builder().id(c.getId()).name(c.getName()).build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDto> getMenuItems(Long categoryId, Boolean availableOnly) {
        List<MenuItem> items;
        if (categoryId != null && Boolean.TRUE.equals(availableOnly)) {
            items = menuItemRepository.findByCategoryIdAndAvailableTrue(categoryId);
        } else if (categoryId != null) {
            items = menuItemRepository.findByCategoryId(categoryId);
        } else if (Boolean.TRUE.equals(availableOnly)) {
            items = menuItemRepository.findByAvailableTrue();
        } else {
            items = menuItemRepository.findAll();
        }

        return items.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemDto getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        return mapToDto(item);
    }

    @Transactional
    public MenuItemDto createMenuItem(MenuItemCreateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        MenuItem item = MenuItem.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        MenuItem saved = menuItemRepository.save(item);
        return mapToDto(saved);
    }

    @Transactional
    public MenuItemDto updateMenuItem(Long id, MenuItemUpdateRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            item.setCategory(category);
        }
        if (request.getName() != null) {
            item.setName(request.getName());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            item.setPrice(request.getPrice());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }

        MenuItem updated = menuItemRepository.save(item);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("MenuItem", "id", id);
        }
        menuItemRepository.deleteById(id);
    }

    private MenuItemDto mapToDto(MenuItem item) {
        return MenuItemDto.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .available(item.getAvailable())
                .build();
    }
}
