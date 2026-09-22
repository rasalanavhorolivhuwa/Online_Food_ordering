package net_javaguides.food_order_system.mapper;

import net_javaguides.food_order_system.dto.CartItemDto;
import net_javaguides.food_order_system.entity.CartItem;

import java.math.BigDecimal;

public class CartItemMapper {


    // ENTITY → DTO
    public static CartItemDto mapToCartItemDto(
            CartItem cartItem) {

        BigDecimal itemTotal =
                cartItem.getMenuItem()
                        .getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        cartItem.getQuantity()
                                )
                        );

        return new CartItemDto(
                cartItem.getId(),
                cartItem.getCart().getId(),
                cartItem.getMenuItem().getId(),
                cartItem.getQuantity(),
                cartItem.getMenuItem().getPrice(),
                itemTotal
        );
    }

    // DTO → ENTITY
    public static CartItem mapToCartItem(
            CartItemDto cartItemDto) {

        return new CartItem(
                cartItemDto.getId(),
                null,
                null,
                cartItemDto.getQuantity()
        );
    }

}
