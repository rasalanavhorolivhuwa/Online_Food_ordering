package net_javaguides.food_order_system.service;

import net_javaguides.food_order_system.dto.OrderDto;

import java.util.List;

public interface OrderService {


    OrderDto placeOrder(Long studentId);

    OrderDto getOrderById(Long id);

    OrderDto getOrderByOrderNumber(String orderNumber);

    List<OrderDto> getOrderHistory(Long studentId);

    OrderDto updateOrderStatus(Long id, String status);
}
