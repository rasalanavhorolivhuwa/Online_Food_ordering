package net_javaguides.food_order_system.repository;

import net_javaguides.food_order_system.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(Long cartId);
    void deleteByCartId(Long cartId);
}
