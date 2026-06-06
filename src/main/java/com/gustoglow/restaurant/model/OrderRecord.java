package com.gustoglow.restaurant.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_records")
public class OrderRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderCode;
    private String date;
    private Double total;
    private String payment;
    private String status;
    private Long createdAt;
    private String customerName;
    private String customerPhone;
    private String deliveryAddress;
    private String riderName;
    private String restaurantName;
    private String restaurantCoordinates;
    private String serviceType;
    private String tableNumber;
    private Integer numberOfGuests;
    private String dineInTime;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Transient
    private Long customerId;

    @OneToMany(mappedBy = "orderRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Constructors
    public OrderRecord() {}

    public OrderRecord(String orderCode, String date, Double total, String payment, String status, Long createdAt) {
        this.orderCode = orderCode;
        this.date = date;
        this.total = total;
        this.payment = payment;
        this.status = status;
        this.createdAt = createdAt;
    }

    public OrderRecord(String orderCode, String date, Double total, String payment, String status, Long createdAt, String customerName, String customerPhone, String deliveryAddress) {
        this.orderCode = orderCode;
        this.date = date;
        this.total = total;
        this.payment = payment;
        this.status = status;
        this.createdAt = createdAt;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.deliveryAddress = deliveryAddress;
    }

    // Helper method to add items and manage the bi-directional relationship
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrderRecord(this);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getPayment() { return payment; }
    public void setPayment(String payment) { this.payment = payment; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public String getRiderName() { return riderName; }
    public void setRiderName(String riderName) { this.riderName = riderName; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getRestaurantCoordinates() { return restaurantCoordinates; }
    public void setRestaurantCoordinates(String restaurantCoordinates) { this.restaurantCoordinates = restaurantCoordinates; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getTableNumber() { return tableNumber; }
    public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }

    public Integer getNumberOfGuests() { return numberOfGuests; }
    public void setNumberOfGuests(Integer numberOfGuests) { this.numberOfGuests = numberOfGuests; }

    public String getDineInTime() { return dineInTime; }
    public void setDineInTime(String dineInTime) { this.dineInTime = dineInTime; }
}
