package net_javaguides.food_order_system.mapper;

import net_javaguides.food_order_system.dto.OrderDto;
import net_javaguides.food_order_system.entity.Order;

public class OrderMapper {

    public static OrderDto mapToOrderDto(Order order) {

        return new OrderDto(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getOrderDate(),
                order.getStudent().getId()
        );
    }


    // DTO → ENTITY
    public static Order mapToOrder(OrderDto orderDto) {

        return new Order(
                orderDto.getId(),
                orderDto.getOrderNumber(),
                orderDto.getTotalAmount(),
                orderDto.getStatus(),
                orderDto.getOrderDate(),
                null
        );
    }
}
