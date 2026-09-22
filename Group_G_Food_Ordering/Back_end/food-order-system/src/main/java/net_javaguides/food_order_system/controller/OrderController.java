package net_javaguides.food_order_system.controller;


import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.OrderDto;
import net_javaguides.food_order_system.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private OrderService orderService;

    // Place an order
    @PostMapping("{studentId}")
    public ResponseEntity<OrderDto> placeOrder(
            @PathVariable("studentId") Long studentId) {

        OrderDto order = orderService.placeOrder(studentId);

        return new ResponseEntity<>(order, HttpStatus.CREATED
        );
    }


    // Get order by ID
    @GetMapping("{id}")
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable("id") Long id) {

        OrderDto order = orderService.getOrderById(id);

        return ResponseEntity.ok(order);
    }

    // Get order by order number
    @GetMapping("{orderNumber}")
    public ResponseEntity<OrderDto> getOrderByOrderNumber(@PathVariable("orderNumber") String orderNumber) {

        OrderDto order = orderService.getOrderByOrderNumber(orderNumber);

        return ResponseEntity.ok(order);
    }

    // Get student's order history
    @GetMapping("{studentId}/history")
    public ResponseEntity<List<OrderDto>> getOrderHistory(
            @PathVariable("studentId") Long studentId) {

        List<OrderDto> orders = orderService.getOrderHistory(studentId);
        return ResponseEntity.ok(orders);
    }


    // Update order status
    @PutMapping("{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable("id") Long id,
            @RequestParam String status) {

        OrderDto order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }


}
