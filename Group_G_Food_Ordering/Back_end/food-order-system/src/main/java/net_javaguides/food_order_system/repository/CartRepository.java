package net_javaguides.food_order_system.repository;

import net_javaguides.food_order_system.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByStudentId(Long studentId);
}
