package net_javaguides.food_order_system.service.Impl;


import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.MenuItemDto;
import net_javaguides.food_order_system.entity.MenuItem;
import net_javaguides.food_order_system.entity.Shop;
import net_javaguides.food_order_system.mapper.MenuItemMapper;
import net_javaguides.food_order_system.repository.MenuItemRepository;
import net_javaguides.food_order_system.repository.ShopRepository;
import net_javaguides.food_order_system.service.MenuItemService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {


    private MenuItemRepository menuItemRepository;
    private ShopRepository shopRepository;

    // CREATE MENU ITEM
    @Override
    public MenuItemDto createMenuItem(MenuItemDto menuItemDto) {

        Shop shop = shopRepository.findById(menuItemDto.getShopId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shop not found with id: " + menuItemDto.getShopId()
                        ));

        MenuItem menuItem = MenuItemMapper.mapToMenuItem(menuItemDto);

        menuItem.setShop(shop);

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);

        return MenuItemMapper.mapToMenuItemDto(savedMenuItem);

    }


    // GET MENU ITEM BY NAME
    @Override
    public MenuItemDto getMenuItemByName(String name) {

        MenuItem menuItem = menuItemRepository.findByName(name)
                        .orElseThrow(() -> new RuntimeException(
                                        "Menu item not found with name: " + name
                                ));

        return MenuItemMapper.mapToMenuItemDto(menuItem);
    }


    // GET ALL MENU ITEMS
    @Override
    public List<MenuItemDto> getAllMenuItems() {
        List<MenuItem> menuItems =
                menuItemRepository.findAll();

        return menuItems.stream()
                .map(MenuItemMapper::mapToMenuItemDto)
                .collect(Collectors.toList());
    }


    // UPDATE MENU ITEM
    @Override
    public MenuItemDto updateMenuItem(Long id, MenuItemDto updatedMenuItem) {

        MenuItem menuItem = menuItemRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException(
                                        "Menu item not found with id: " + id
                                ));


        menuItem.setName(updatedMenuItem.getName());

        menuItem.setDescription(updatedMenuItem.getDescription());

        menuItem.setPrice(updatedMenuItem.getPrice());

        menuItem.setAvailability(updatedMenuItem.getAvailability());

        menuItem.setImage(updatedMenuItem.getImage());

        // Update Shop relationship
        Shop shop = new Shop();

        shop.setId(updatedMenuItem.getShopId());

        menuItem.setShop(shop);

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);

        return MenuItemMapper.mapToMenuItemDto(savedMenuItem);

    }

    //DELETE
    @Override
    public void deleteMenuItem(Long id) {

        MenuItem menuItem = menuItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Menu item not found with id: " + id
                                ));

        menuItemRepository.delete(menuItem);
    }
}
