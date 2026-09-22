package net_javaguides.food_order_system.controller;


import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.CartItemDto;
import net_javaguides.food_order_system.service.CartItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/cart-items")
public class CartItemController {

    private CartItemService cartItemService;


    // ADD ITEM TO CART
    @PostMapping
    public ResponseEntity<CartItemDto> addCartItem(
            @RequestBody CartItemDto cartItemDto) {

        CartItemDto savedCartItem =
                cartItemService.addCartItem(
                        cartItemDto
                );

        return new ResponseEntity<>(
                savedCartItem,
                HttpStatus.CREATED
        );
    }

    // VIEW ITEMS IN CART
    @GetMapping("{cartId}")
    public ResponseEntity<List<CartItemDto>> getCartItemsByCartId(@PathVariable("cartId") Long cartId) {

        List<CartItemDto> cartItems = cartItemService.getCartItemsByCartId(cartId);

        return ResponseEntity.ok(cartItems);
    }


    // UPDATE QUANTITY
    @PutMapping("{id}")
    public ResponseEntity<CartItemDto> updateCartItem(@PathVariable("id") Long id, @RequestBody CartItemDto updatedCartItem) {

        CartItemDto cartItemDto = cartItemService.updateCartItem(id, updatedCartItem);

        return ResponseEntity.ok(cartItemDto);
    }

    // REMOVE ITEM FROM CART
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteCartItem(@PathVariable("id") Long id) {

        cartItemService.deleteCartItem(id);

        return ResponseEntity.ok("Cart item deleted successfully");
    }


    // CALCULATE CART TOTAL

    @GetMapping("{total}/total")
    public ResponseEntity<BigDecimal> calculateCartTotal(
            @PathVariable("cartId") Long cartId) {

        BigDecimal total = cartItemService.calculateCartTotal(cartId);

        return ResponseEntity.ok(total);
    }


}
