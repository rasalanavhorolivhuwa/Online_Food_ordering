package net_javaguides.food_order_system.service;

import net_javaguides.food_order_system.dto.ShopDto;

import java.util.List;

public interface ShopService {

    ShopDto createShop(ShopDto shopDto);

    ShopDto getShopByName(String shopName);

    List<ShopDto> getAllShops();
    ShopDto updateShop(Long id, ShopDto updatedShop);

    void deleteShop(Long id);
}
