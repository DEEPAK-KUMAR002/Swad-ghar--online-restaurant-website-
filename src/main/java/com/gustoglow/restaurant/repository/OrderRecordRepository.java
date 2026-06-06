package com.gustoglow.restaurant.repository;

import com.gustoglow.restaurant.model.OrderRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRecordRepository extends JpaRepository<OrderRecord, Long> {
    List<OrderRecord> findAllByOrderByCreatedAtDesc();
    List<OrderRecord> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);
}
