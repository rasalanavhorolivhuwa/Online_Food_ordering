package net_javaguides.food_order_system.service.Impl;

import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.ShopDto;
import net_javaguides.food_order_system.entity.Shop;
import net_javaguides.food_order_system.mapper.ShopMapper;
import net_javaguides.food_order_system.repository.ShopRepository;
import net_javaguides.food_order_system.service.ShopService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ShopServiceImpl implements ShopService {

    private ShopRepository shopRepository;


    // CREATE SHOP
    @Override
    public ShopDto createShop(ShopDto shopDto) {

        Shop shop = ShopMapper.mapToShop(shopDto);

        Shop savedShop = shopRepository.save(shop);

        return ShopMapper.mapToShopDto(savedShop);

    }

    // GET SHOP BY NAME

    @Override
    public ShopDto getShopByName(String shopName) {

        Shop shop = shopRepository.findByShopName(shopName)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shop not found with name: " + shopName));

        return ShopMapper.mapToShopDto(shop);
    }


    // GET ALL SHOPS
    @Override
    public List<ShopDto> getAllShops() {

        List<Shop> shops = shopRepository.findAll();

        return shops.stream()
                .map(ShopMapper::mapToShopDto)
                .collect(Collectors.toList());
    }


    // UPDATE SHOP
    @Override
    public ShopDto updateShop(Long id, ShopDto updatedShop) {

        Shop shop = shopRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shop not found with id: " + id));

        shop.setShopName(updatedShop.getShopName());
        shop.setStatus(updatedShop.getStatus());

        Shop updatedShopObj = shopRepository.save(shop);

        return ShopMapper.mapToShopDto(updatedShopObj);
    }



    //DELETE SHOP

    @Override
    public void deleteShop(Long id) {
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shop not found with id: " + id));

        shopRepository.delete(shop);
    }
}
