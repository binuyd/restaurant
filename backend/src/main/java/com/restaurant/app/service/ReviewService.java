package com.restaurant.app.service;

import com.restaurant.app.domain.entities.MenuItem;
import com.restaurant.app.domain.entities.Review;
import com.restaurant.app.domain.entities.User;
import com.restaurant.app.dto.ReviewDtos.*;
import com.restaurant.app.exception.ResourceNotFoundException;
import com.restaurant.app.repository.MenuItemRepository;
import com.restaurant.app.repository.ReviewRepository;
import com.restaurant.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewDto addReview(Long menuItemId, Long userId, CreateReviewRequest request) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId));

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        Review review = Review.builder()
                .menuItem(menuItem)
                .user(user)
                .customerName(request.getCustomerName())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsByMenuItem(Long menuItemId) {
        return reviewRepository.findByMenuItemIdOrderByCreatedAtDesc(menuItemId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemRatingSummaryDto> getRatingSummaries() {
        List<Object[]> rows = reviewRepository.findRatingSummaries();
        List<MenuItemRatingSummaryDto> summaries = new ArrayList<>();
        for (Object[] row : rows) {
            Long itemId = ((Number) row[0]).longValue();
            Double avg = ((Number) row[1]).doubleValue();
            Long count = ((Number) row[2]).longValue();
            summaries.add(new MenuItemRatingSummaryDto(itemId, Math.round(avg * 10.0) / 10.0, count));
        }
        return summaries;
    }

    private ReviewDto mapToDto(Review r) {
        return ReviewDto.builder()
                .id(r.getId())
                .menuItemId(r.getMenuItem().getId())
                .menuItemName(r.getMenuItem().getName())
                .customerName(r.getCustomerName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
