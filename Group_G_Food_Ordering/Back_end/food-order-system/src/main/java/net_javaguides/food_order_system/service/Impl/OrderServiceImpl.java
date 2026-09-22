package net_javaguides.food_order_system.service.Impl;


import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.OrderDto;
import net_javaguides.food_order_system.entity.*;
import net_javaguides.food_order_system.mapper.OrderMapper;
import net_javaguides.food_order_system.repository.*;
import net_javaguides.food_order_system.service.OrderService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private OrderRepository orderRepository;
    private OrderItemRepository orderItemRepository;
    private StudentRepository studentRepository;
    private CartRepository cartRepository;
    private CartItemRepository cartItemRepository;



    @Override
    @Transactional
    public OrderDto placeOrder(Long studentId) {

        // Find student
        Student student = studentRepository.findById(studentId).orElseThrow(() ->
                                new RuntimeException("Student not found with id: " + studentId));

        // Find student's cart
        Cart cart = cartRepository.findByStudentId(studentId).orElseThrow(() ->
                                new RuntimeException("Cart not found for student id: " + studentId));

        // Get items from cart
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

// Check if cart is empty
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot place order because cart is empty");
        }

        // Calculate total order amount
        BigDecimal totalAmount = cartItems.stream().map(cartItem ->
                                cartItem.getMenuItem().getPrice().multiply(
                                                         BigDecimal.valueOf(
                                                        cartItem.getQuantity()
                                                )
                                        )
                        ).reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

// Generate unique order number
        String orderNumber = "ORD-" + UUID.randomUUID().toString()
                                                       .substring(0, 8)
                                                      .toUpperCase();
        // Create Order
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setTotalAmount(totalAmount);
        order.setStatus("ORDER RECEIVED");
        order.setOrderDate(LocalDateTime.now());
        order.setStudent(student);


        // Save Order
        Order savedOrder = orderRepository.save(order);


        // Create OrderItems from CartItems
        for (CartItem cartItem : cartItems) {

            BigDecimal price = cartItem.getMenuItem().getPrice();

            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity())
                    );

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(savedOrder);

            orderItem.setMenuItem(cartItem.getMenuItem());

            orderItem.setQuantity(
                    cartItem.getQuantity()
            );

            orderItem.setPrice(price);

            orderItem.setItemTotal(itemTotal);

            orderItemRepository.save(orderItem);
        }

        // Clear the cart after the order has been created
        cartItemRepository.deleteByCartId(
                cart.getId()
        );

        return OrderMapper.mapToOrderDto(
                savedOrder
        );

        }



    @Override
    public OrderDto getOrderById(Long id) {


        Order order = orderRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Order not found with id: " + id
                                ));
        return OrderMapper.mapToOrderDto(order);
    }




    @Override
    public OrderDto getOrderByOrderNumber(String orderNumber) {

        Order order = orderRepository.findByOrderNumber(
                                orderNumber
                ).orElseThrow(() -> new RuntimeException(
                                        "Order not found with order number: " + orderNumber
                                ));
        return OrderMapper.mapToOrderDto(order);
    }

    @Override
    public List<OrderDto> getOrderHistory(Long studentId) {


        // Check if student exists
        studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException(
                                "Student not found with id: " + studentId
                        ));

        List<Order> orders = orderRepository.findByStudentId(studentId);

        return orders.stream()
                .map(OrderMapper::mapToOrderDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto updateOrderStatus(Long id, String status) {

        Order order = orderRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException(
                                        "Order not found with id: " + id
                                ));

        String currentStatus = order.getStatus();

        // Cancel order
        if (status.equals("CANCELLED")) {

            if (currentStatus.equals("COLLECTED")) {

                throw new RuntimeException(
                        "Collected order cannot be cancelled"
                );
            }
            order.setStatus("CANCELLED");
        }

        // ORDER_PLACED → PREPARING
        else if (status.equals("PREPARING")) {

            if (!currentStatus.equals("ORDER RECEIVED")) {
                throw new RuntimeException("Order must be ORDER_PLACED before PREPARING");
            }

            order.setStatus("PREPARING");
        }
        // PREPARING → READY_FOR_COLLECTION
        else if (status.equals("READY_FOR_COLLECTION")) {

            if (!currentStatus.equals("PREPARING")) {
                throw new RuntimeException("Order must be PREPARING before READY_FOR_COLLECTION");
            }

            order.setStatus("READY_FOR_COLLECTION");
    }

        // READY_FOR_COLLECTION → COLLECTED
        else if (status.equals("COLLECTED")) {

            if (!currentStatus.equals("READY_FOR_COLLECTION")) {
                throw new RuntimeException("Order must be READY_FOR_COLLECTION before COLLECTED");
            }
            order.setStatus("COLLECTED");
        }

        // Cannot manually set ORDER_PLACED
        else if (status.equals("ORDER_PLACED")) {
            throw new RuntimeException("ORDER_PLACED is the initial order status");
        }


        // Invalid status
        else {
            throw new RuntimeException("Invalid order status: " + status);
        }

        Order updatedOrder = orderRepository.save(order);

        return OrderMapper.mapToOrderDto(updatedOrder);
    }
}
