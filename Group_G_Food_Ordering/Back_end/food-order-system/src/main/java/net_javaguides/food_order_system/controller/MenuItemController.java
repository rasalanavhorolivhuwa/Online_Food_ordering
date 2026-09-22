package net_javaguides.food_order_system.controller;


import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.MenuItemDto;
import net_javaguides.food_order_system.service.MenuItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/menu-items")
public class MenuItemController {


    // Inject MenuItem service
    private MenuItemService menuItemService;


    // CREATE MENU ITEM
    @PostMapping
    public ResponseEntity<MenuItemDto> createMenuItem(
            @RequestBody MenuItemDto menuItemDto) {

        MenuItemDto savedMenuItem = menuItemService.createMenuItem(menuItemDto);

        return new ResponseEntity<>(savedMenuItem, HttpStatus.CREATED);
    }

    // GET MENU ITEM BY NAME

    @GetMapping("{name}")
    public ResponseEntity<MenuItemDto> getMenuItemByName(
            @PathVariable("name") String name) {

        MenuItemDto menuItemDto = menuItemService.getMenuItemByName(name);

        return ResponseEntity.ok(menuItemDto);
    }

    // GET ALL MENU ITEMS
    // GET /api/menu-items
    @GetMapping
    public ResponseEntity<List<MenuItemDto>> getAllMenuItems() {

        List<MenuItemDto> menuItems = menuItemService.getAllMenuItems();

        return ResponseEntity.ok(menuItems);
    }

    // UPDATE MENU ITEM

    @PutMapping("{id}")
    public ResponseEntity<MenuItemDto> updateMenuItem(
            @PathVariable("id") Long id,
            @RequestBody MenuItemDto updatedMenuItem) {

        MenuItemDto menuItemDto = menuItemService.updateMenuItem(id, updatedMenuItem);

        return ResponseEntity.ok(menuItemDto);
    }



    // DELETE MENU ITEM
    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteMenuItem(@PathVariable("id") Long id) {

        menuItemService.deleteMenuItem(id);

        return ResponseEntity.ok("Menu item deleted successfully");
    }




}
