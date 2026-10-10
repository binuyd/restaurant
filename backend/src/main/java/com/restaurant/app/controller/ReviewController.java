package com.restaurant.app.controller;

import com.restaurant.app.dto.ReviewDtos.*;
import com.restaurant.app.security.UserPrincipal;
import com.restaurant.app.service.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Customer Dish Reviews", description = "Endpoints for customer ratings and reviews on dishes")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/item/{menuItemId}")
    @Operation(summary = "Get all reviews for a specific menu item")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Long menuItemId) {
        return ResponseEntity.ok(reviewService.getReviewsByMenuItem(menuItemId));
    }

    @GetMapping("/summaries")
    @Operation(summary = "Get average ratings and review counts across all menu items")
    public ResponseEntity<List<MenuItemRatingSummaryDto>> getRatingSummaries() {
        return ResponseEntity.ok(reviewService.getRatingSummaries());
    }

    @PostMapping("/item/{menuItemId}")
    @Operation(summary = "Submit a review and star rating for a menu item")
    public ResponseEntity<ReviewDto> addReview(
            @PathVariable Long menuItemId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReviewRequest request) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        ReviewDto dto = reviewService.addReview(menuItemId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
