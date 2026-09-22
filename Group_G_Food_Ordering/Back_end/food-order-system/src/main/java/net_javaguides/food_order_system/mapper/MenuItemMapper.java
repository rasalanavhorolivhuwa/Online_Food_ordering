package net_javaguides.food_order_system.mapper;


import net_javaguides.food_order_system.dto.MenuItemDto;
import net_javaguides.food_order_system.entity.MenuItem;


public class MenuItemMapper {


    public static MenuItemDto mapToMenuItemDto(MenuItem menuItem) {

        return new MenuItemDto(
                menuItem.getId(),
                menuItem.getName(),
                menuItem.getDescription(),
                menuItem.getPrice(),
                menuItem.getAvailability(),

                // Relationship: get Shop ID
                menuItem.getShop().getId(),

                // Image URL
                menuItem.getImage()
        );
    }

    public static MenuItem mapToMenuItem(MenuItemDto menuItemDto) {

        return new MenuItem(
                menuItemDto.getId(),
                menuItemDto.getName(),
                menuItemDto.getDescription(),
                menuItemDto.getPrice(),
                menuItemDto.getAvailability(),
                null,
                menuItemDto.getImage()
        );
    }
}
