package com.gustoglow.restaurant.controller;

import com.gustoglow.restaurant.model.Complaint;
import com.gustoglow.restaurant.repository.ComplaintRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;

    public ComplaintController(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<?> submitComplaint(@RequestBody Complaint complaint) {
        complaint.setCreatedAt(LocalDateTime.now());
        if (complaint.getStatus() == null || complaint.getStatus().isEmpty()) {
            complaint.setStatus("Pending");
        }
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Complaint registered in H2 database",
            "complaintCode", saved.getComplaintCode(),
            "id", saved.getId()
        ));
    }
}
