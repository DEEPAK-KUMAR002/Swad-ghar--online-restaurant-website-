package com.gustoglow.restaurant.controller;

import com.gustoglow.restaurant.model.Customer;
import com.gustoglow.restaurant.repository.CustomerRepository;
import com.gustoglow.restaurant.util.PasswordUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomerRepository customerRepository;

    public AuthController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");
        String phone = payload.get("phone");
        String address = payload.get("address");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and password are required."));
        }

        email = email.trim().toLowerCase();

        Optional<Customer> existing = customerRepository.findByEmail(email);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "An account with this email already exists."));
        }

        String salt = PasswordUtil.generateSalt();
        String passwordHash = PasswordUtil.hashPassword(password, salt);

        Customer customer = new Customer(name, email, passwordHash, salt, phone, address);
        Customer saved = customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Account registered successfully!",
            "customer", saved
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and password are required."));
        }

        email = email.trim().toLowerCase();

        Optional<Customer> optionalCustomer = customerRepository.findByEmail(email);
        if (optionalCustomer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid email or password."));
        }

        Customer customer = optionalCustomer.get();
        String computedHash = PasswordUtil.hashPassword(password, customer.getSalt());
        if (!computedHash.equals(customer.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid email or password."));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Logged in successfully!",
            "customer", customer
        ));
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload) {
        Long id = null;
        if (payload.get("id") != null) {
            id = Long.valueOf(payload.get("id").toString());
        }
        String name = (String) payload.get("name");
        String phone = (String) payload.get("phone");
        String address = (String) payload.get("address");

        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Customer ID is required."));
        }

        Optional<Customer> optionalCustomer = customerRepository.findById(id);
        if (optionalCustomer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Customer not found."));
        }

        Customer customer = optionalCustomer.get();
        if (name != null) customer.setName(name);
        if (phone != null) customer.setPhone(phone);
        if (address != null) customer.setAddress(address);

        Customer saved = customerRepository.save(customer);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Profile updated successfully!",
            "customer", saved
        ));
    }
}
