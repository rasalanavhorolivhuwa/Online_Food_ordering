package net_javaguides.food_order_system.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "availability", nullable = false)
    private Boolean availability;


    // RELATIONSHIP BETWEEN SHOP AND MENU ITEM
    // ONE SHOP CAN HAVE MANY MENU ITEMS
    // ONE MENU ITEM BELONGS TO ONE SHOP

    @ManyToOne
    @JoinColumn(name = "shop_id" ,nullable = false)
    private Shop shop;



    // The actual image is stored in the database.
    // byte[] stores the binary image data.
    // @Lob tells JPA this is a large binary object.
    // =====================================================
    @Lob
    @Column(name = "image")
    private String image;
}
