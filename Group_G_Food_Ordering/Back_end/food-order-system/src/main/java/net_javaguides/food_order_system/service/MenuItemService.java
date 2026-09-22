package net_javaguides.food_order_system.service;

import net_javaguides.food_order_system.dto.MenuItemDto;

import java.util.List;

public interface MenuItemService {

    MenuItemDto createMenuItem(MenuItemDto menuItemDto);
    MenuItemDto getMenuItemByName(String name);
    List<MenuItemDto> getAllMenuItems();
    MenuItemDto updateMenuItem(Long id, MenuItemDto updatedMenuItem);
    void deleteMenuItem(Long id);
}
