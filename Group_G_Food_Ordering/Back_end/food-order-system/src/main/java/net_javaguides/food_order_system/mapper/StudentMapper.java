package net_javaguides.food_order_system.mapper;


import net_javaguides.food_order_system.dto.StudentDto;
import net_javaguides.food_order_system.entity.Student;

public class StudentMapper {

    public static StudentDto mapToStudentDto(Student student) {

        return new StudentDto(
                student.getId(),
                student.getStudentNumber(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getContact(),
                student.getPassword()
        );
    }

    public static Student mapToStudent(StudentDto studentDto) {

        return new Student(
                studentDto.getId(),
                studentDto.getStudentNumber(),
                studentDto.getFirstName(),
                studentDto.getLastName(),
                studentDto.getEmail(),
                studentDto.getContact(),
                studentDto.getPassword()
        );
    }

}
