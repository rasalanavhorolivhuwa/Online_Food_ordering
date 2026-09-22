package net_javaguides.food_order_system.repository;

import net_javaguides.food_order_system.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    Optional<Shop> findByShopName(String shopName);

}
