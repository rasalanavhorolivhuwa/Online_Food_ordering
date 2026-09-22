package net_javaguides.food_order_system.service;

import net_javaguides.food_order_system.dto.StudentDto;

import java.util.List;

public interface StudentService {

    StudentDto createStudent(StudentDto studentDto);

    StudentDto getStudentById(Long id);

    List<StudentDto> getAllStudents();

    StudentDto updateStudent(Long id, StudentDto studentDto);

    void deleteStudent(Long id);
}
