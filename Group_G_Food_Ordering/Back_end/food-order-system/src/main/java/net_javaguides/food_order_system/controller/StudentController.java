package net_javaguides.food_order_system.controller;

import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.StudentDto;
import net_javaguides.food_order_system.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@AllArgsConstructor
@RequestMapping("/api/students")
public class StudentController {

    //inject dependency
    private StudentService studentService;

    //CREATE STUDENT API

    @PostMapping
    public ResponseEntity<StudentDto> createStudent(
            @RequestBody StudentDto studentDto) {

        StudentDto savedStudent =
                studentService.createStudent(studentDto);

        return new ResponseEntity<>(
                savedStudent,
                HttpStatus.CREATED
        );
    }

    //GET  STUDENT BY ID API

    @GetMapping("{id}")
    public ResponseEntity<StudentDto> getStudentById(
            @PathVariable("id") Long id) {

        StudentDto studentDto = studentService.getStudentById(id);

        return ResponseEntity.ok(studentDto);
    }

    //GET ALL STUDENT  API
    @GetMapping
    public ResponseEntity<List<StudentDto>> getAllStudents() {

        List<StudentDto> students = studentService.getAllStudents();

        return ResponseEntity.ok(students);
    }


    //UPDATE STUDENT  API

    @PutMapping("{id}")
    public ResponseEntity<StudentDto> updateStudent(
            @PathVariable("id") Long id,
            @RequestBody StudentDto updatedStudent) {

        StudentDto studentDto = studentService.updateStudent(id, updatedStudent);

        return ResponseEntity.ok(studentDto);
    }

//DELETE API

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteStudent(
            @PathVariable("id") Long id) {

        studentService.deleteStudent(id);

        return ResponseEntity.ok("Student deleted successfully");
    }
}
