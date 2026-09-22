package net_javaguides.food_order_system.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {

    private Long id;
    private Long cartId;
    private Long menuItemId;
    private Integer quantity;

    // PRICE OF ONE MENU ITEM
    private BigDecimal price;

    // PRICE × QUANTITY
    private BigDecimal itemTotal;
}
