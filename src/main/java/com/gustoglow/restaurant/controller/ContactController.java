package com.gustoglow.restaurant.controller;

import com.gustoglow.restaurant.model.ContactMessage;
import com.gustoglow.restaurant.repository.ContactMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;

    public ContactController(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitMessage(@RequestBody ContactMessage message) {
        message.setCreatedAt(LocalDateTime.now());
        ContactMessage saved = contactMessageRepository.save(message);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Message received",
            "id", saved.getId()
        ));
    }
}
