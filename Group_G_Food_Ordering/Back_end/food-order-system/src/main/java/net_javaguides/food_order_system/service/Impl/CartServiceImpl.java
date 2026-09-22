package net_javaguides.food_order_system.service.Impl;

import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.CartDto;
import net_javaguides.food_order_system.entity.Cart;
import net_javaguides.food_order_system.entity.Student;
import net_javaguides.food_order_system.mapper.CartMapper;
import net_javaguides.food_order_system.repository.CartRepository;
import net_javaguides.food_order_system.repository.StudentRepository;
import net_javaguides.food_order_system.service.CartService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CartServiceImpl implements CartService {

    private CartRepository cartRepository;

    private StudentRepository studentRepository;


    // CREATE CART
    @Override
    public CartDto createCart(Long studentId) {

        // Find existing student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id: " + studentId));

        // Check if student already has a cart
        if (cartRepository.findByStudentId(studentId).isPresent()) {

            throw new RuntimeException("Student already has a cart");
        }

        // Create Cart
        Cart cart = new Cart();

        cart.setStudent(student);

        // Save Cart
        Cart savedCart =
                cartRepository.save(cart);

        return CartMapper.mapToCartDto(savedCart);
    }


    // GET CART BY STUDENT ID
    @Override
    public CartDto getCartByStudentId(Long studentId) {
        Cart cart =
                cartRepository.findByStudentId(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart not found for student id: "
                                                + studentId
                                ));

        return CartMapper.mapToCartDto(cart);
    }






    @Override
    public void deleteCart(Long id) {

        Cart cart = cartRepository.findById(id).orElseThrow(() ->
                                new RuntimeException(
                                        "Cart not found with id: " + id
                                ));

        cartRepository.delete(cart);

    }
}







