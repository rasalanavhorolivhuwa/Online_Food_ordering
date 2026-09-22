package net_javaguides.food_order_system.controller;


import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.ShopDto;
import net_javaguides.food_order_system.service.ShopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/shops")
public class ShopController {

    // Inject dependency
    private ShopService shopService;


    // CREATE SHOP API
    @PostMapping
    public ResponseEntity<ShopDto> createShop(
            @RequestBody ShopDto shopDto) {

        ShopDto savedShop =
                shopService.createShop(shopDto);

        return new ResponseEntity<>(
                savedShop,
                HttpStatus.CREATED
        );
    }



    // GET SHOP BY NAME API
    @GetMapping("{shopName}")
    public ResponseEntity<ShopDto> getShopByName(
            @PathVariable("shopName") String shopName) {

        ShopDto shopDto =
                shopService.getShopByName(shopName);

        return ResponseEntity.ok(shopDto);
    }


    // GET ALL SHOPS API
    @GetMapping
    public ResponseEntity<List<ShopDto>> getAllShops() {

        List<ShopDto> shops =
                shopService.getAllShops();

        return ResponseEntity.ok(shops);
    }




    // UPDATE SHOP API
    @PutMapping("{id}")
    public ResponseEntity<ShopDto> updateShop(
            @PathVariable("id") Long id,
            @RequestBody ShopDto updatedShop) {

        ShopDto shopDto =
                shopService.updateShop(id, updatedShop);

        return ResponseEntity.ok(shopDto);
    }


    // DELETE SHOP API
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteShop(
            @PathVariable("id") Long id) {

        shopService.deleteShop(id);

        return ResponseEntity.ok(
                "Shop deleted successfully"
        );
    }
}
