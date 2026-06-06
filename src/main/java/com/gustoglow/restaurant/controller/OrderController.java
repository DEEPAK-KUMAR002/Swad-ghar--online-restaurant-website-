package com.gustoglow.restaurant.controller;

import com.gustoglow.restaurant.model.OrderItem;
import com.gustoglow.restaurant.model.OrderRecord;
import com.gustoglow.restaurant.repository.OrderRecordRepository;
import com.gustoglow.restaurant.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRecordRepository orderRecordRepository;
    private final CustomerRepository customerRepository;

    public OrderController(OrderRecordRepository orderRecordRepository, CustomerRepository customerRepository) {
        this.orderRecordRepository = orderRecordRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<OrderRecord> getOrderHistory() {
        return orderRecordRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/customer/{customerId}")
    public List<OrderRecord> getCustomerOrderHistory(@PathVariable Long customerId) {
        return orderRecordRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId);
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRecord order) {
        // Build association between OrderRecord and list of OrderItems
        List<OrderItem> cartItems = order.getItems();
        order.setItems(new ArrayList<>());
        
        if (cartItems != null) {
            for (OrderItem item : cartItems) {
                order.addItem(item);
            }
        }

        if (order.getCustomerId() != null) {
            customerRepository.findById(order.getCustomerId()).ifPresent(order::setCustomer);
        }

        OrderRecord saved = orderRecordRepository.save(order);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Order logged in database",
            "orderCode", saved.getOrderCode(),
            "id", saved.getId()
        ));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String riderName = payload.get("riderName");
        return orderRecordRepository.findById(id)
            .map(order -> {
                order.setStatus(status);
                if (riderName != null) {
                    order.setRiderName(riderName);
                }
                orderRecordRepository.save(order);
                return ResponseEntity.ok(Map.of("success", true, "message", "Order status updated successfully"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
