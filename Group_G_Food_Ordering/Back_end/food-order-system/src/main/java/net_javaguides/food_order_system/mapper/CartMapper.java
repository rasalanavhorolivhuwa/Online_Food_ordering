package net_javaguides.food_order_system.mapper;

import net_javaguides.food_order_system.dto.CartDto;
import net_javaguides.food_order_system.entity.Cart;

public class CartMapper {

    public static CartDto mapToCartDto(Cart cart) {

        return new CartDto(
                cart.getId(),
                cart.getStudent().getId()
        );
    }

    public static Cart mapToCart(CartDto cartDto) {

        return new Cart(
                cartDto.getId(),
                null
        );
    }

}
