package com.gustoglow.restaurant.controller;

import com.gustoglow.restaurant.model.FoodItem;
import com.gustoglow.restaurant.repository.FoodItemRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class FoodController {

    private final FoodItemRepository foodItemRepository;

    public FoodController(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    @GetMapping
    public List<FoodItem> getAllMenu() {
        return foodItemRepository.findAll();
    }
}
