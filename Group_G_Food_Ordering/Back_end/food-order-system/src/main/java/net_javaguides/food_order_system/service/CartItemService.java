package net_javaguides.food_order_system.service;

import net_javaguides.food_order_system.dto.CartItemDto;

import java.math.BigDecimal;
import java.util.List;

public interface CartItemService {



    // ADD ITEM TO CART
    CartItemDto addCartItem(CartItemDto cartItemDto);

    // VIEW ITEMS IN CART
    List<CartItemDto> getCartItemsByCartId(Long cartId);

    // UPDATE QUANTITY
    CartItemDto updateCartItem(Long id, CartItemDto updatedCartItem);

    // REMOVE ITEM FROM CART
    void deleteCartItem(Long id);

    // CALCULATE CART TOTAL
    BigDecimal calculateCartTotal(Long cartId);
}
