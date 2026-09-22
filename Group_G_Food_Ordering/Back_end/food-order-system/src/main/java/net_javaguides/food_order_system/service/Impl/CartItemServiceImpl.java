package net_javaguides.food_order_system.service.Impl;


import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.CartItemDto;
import net_javaguides.food_order_system.entity.Cart;
import net_javaguides.food_order_system.entity.CartItem;
import net_javaguides.food_order_system.entity.MenuItem;
import net_javaguides.food_order_system.mapper.CartItemMapper;
import net_javaguides.food_order_system.repository.CartItemRepository;
import net_javaguides.food_order_system.repository.CartRepository;
import net_javaguides.food_order_system.repository.MenuItemRepository;
import net_javaguides.food_order_system.service.CartItemService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CartItemServiceImpl implements CartItemService {

    private CartItemRepository cartItemRepository;

    private CartRepository cartRepository;

    private MenuItemRepository menuItemRepository;


    // ADD ITEM TO CART
    @Override
    public CartItemDto addCartItem(CartItemDto cartItemDto) {

        // FIND CART
        Cart cart = cartRepository.findById(
                cartItemDto.getCartId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Cart not found with id: "
                                + cartItemDto.getCartId()
                ));



        // FIND MENU ITEM
        MenuItem menuItem =
                menuItemRepository.findById(
                        cartItemDto.getMenuItemId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Menu item not found with id: "
                                        + cartItemDto.getMenuItemId()
                        ));


        // CHECK QUANTITY
        if (cartItemDto.getQuantity() == null ||
                cartItemDto.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        // CONVERT DTO TO ENTITY
        CartItem cartItem =
                CartItemMapper.mapToCartItem(cartItemDto);

        // ASSIGN CART
        cartItem.setCart(cart);

        // ASSIGN MENU ITEM
        cartItem.setMenuItem(menuItem);

        // SAVE CART ITEM
        CartItem savedCartItem =
                cartItemRepository.save(cartItem);

        return CartItemMapper.mapToCartItemDto(
                savedCartItem
        );
    }




    // VIEW ITEMS IN CART

    @Override
    public List<CartItemDto> getCartItemsByCartId(Long cartId) {

        // CHECK THAT CART EXISTS
        cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException(
                                "Cart not found with id: " + cartId
                        ));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cartId);

        return cartItems.stream()
                .map(CartItemMapper::mapToCartItemDto)
                .collect(Collectors.toList());
    }



    @Override
    public CartItemDto updateCartItem(Long id, CartItemDto updatedCartItem) {

        CartItem cartItem = cartItemRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + id
                                ));


        // CHECK QUANTITY
        if (updatedCartItem.getQuantity() == null ||
                updatedCartItem.getQuantity() <= 0) {

            throw new RuntimeException("Quantity must be greater than zero");
        }

        // UPDATE QUANTITY
        cartItem.setQuantity(
                updatedCartItem.getQuantity()
        );

        // SAVE
        CartItem savedCartItem = cartItemRepository.save(cartItem);

        return CartItemMapper.mapToCartItemDto(savedCartItem);

    }


    // REMOVE ITEM FROM CART
    @Override
    public void deleteCartItem(Long id) {

        CartItem cartItem = cartItemRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + id
                                ));

        cartItemRepository.delete(cartItem);
    }


    // CALCULATE CART TOTAL
    @Override
    public BigDecimal calculateCartTotal(Long cartId) {

        // CHECK THAT CART EXISTS
        cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found with id: " + cartId
                        ));

        // GET ALL ITEMS IN CART
        List<CartItem> cartItems = cartItemRepository.findByCartId(cartId);

        // ADD ALL ITEM TOTALS
        return cartItems.stream().map(cartItem ->
                        cartItem.getMenuItem().getPrice().multiply(
                                        BigDecimal.valueOf(cartItem.getQuantity()))
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

    }

}
