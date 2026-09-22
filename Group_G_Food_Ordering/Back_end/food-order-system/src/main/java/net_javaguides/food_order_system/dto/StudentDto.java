package net_javaguides.food_order_system.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {

    private Long id;
    private String studentNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String contact;
    private String password;


}
