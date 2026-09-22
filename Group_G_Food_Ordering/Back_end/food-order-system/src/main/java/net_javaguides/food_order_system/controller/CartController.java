package net_javaguides.food_order_system.controller;

import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.CartDto;
import net_javaguides.food_order_system.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/carts")
public class CartController {

    private CartService cartService;

    // CREATE CART
    @PostMapping("{studentId}")
    public ResponseEntity<CartDto> createCart(
            @PathVariable("studentId") Long studentId) {

        CartDto savedCart = cartService.createCart(studentId);

        return new ResponseEntity<>(savedCart, HttpStatus.CREATED);
    }


    // GET CART BY STUDENT
    @GetMapping("{studentId}")
    public ResponseEntity<CartDto> getCartByStudentId(
            @PathVariable("studentId") Long studentId) {

        CartDto cartDto = cartService.getCartByStudentId(studentId);

        return ResponseEntity.ok(cartDto);
    }

    // DELETE CART

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteCart(
            @PathVariable("id") Long id) {

        cartService.deleteCart(id);

        return ResponseEntity.ok(
                "Cart deleted successfully"
        );
    }

}
