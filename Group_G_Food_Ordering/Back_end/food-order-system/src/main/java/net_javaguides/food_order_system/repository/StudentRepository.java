package net_javaguides.food_order_system.repository;

import net_javaguides.food_order_system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository  extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentNumber(String studentNumber);

    Optional<Student> findByEmail(String email);
}
