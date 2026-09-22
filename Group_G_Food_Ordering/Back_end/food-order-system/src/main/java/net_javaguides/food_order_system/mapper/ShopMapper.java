package net_javaguides.food_order_system.mapper;

import net_javaguides.food_order_system.dto.ShopDto;
import net_javaguides.food_order_system.entity.Shop;

public class ShopMapper {

    public static ShopDto mapToShopDto(Shop shop) {

        return new ShopDto(
                shop.getId(),
                shop.getShopName(),
                shop.getStatus()
        );
    }

    public static Shop mapToShop(ShopDto shopDto) {

        return new Shop(
                shopDto.getId(),
                shopDto.getShopName(),
                shopDto.getStatus()
        );
    }

}
