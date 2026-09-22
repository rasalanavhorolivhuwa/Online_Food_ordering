package net_javaguides.food_order_system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;


    // MANY CART ITEMS BELONG TO ONE CART
    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // MANY CART ITEMS CAN REFER TO ONE MENU ITEM
    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;


    // NUMBER OF THIS MENU ITEM IN THE CART
    @Column(name = "quantity", nullable = false)
    private Integer quantity;


}
