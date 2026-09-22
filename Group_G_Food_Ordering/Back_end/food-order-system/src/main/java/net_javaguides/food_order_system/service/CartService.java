package net_javaguides.food_order_system.service;

import net_javaguides.food_order_system.dto.CartDto;

import java.util.List;

public interface CartService {

    CartDto createCart(Long studentId);

    CartDto getCartByStudentId(Long studentId);

    void deleteCart(Long id);
}
