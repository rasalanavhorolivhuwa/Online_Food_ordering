package net_javaguides.food_order_system.service.Impl;

import lombok.AllArgsConstructor;
import net_javaguides.food_order_system.dto.StudentDto;
import net_javaguides.food_order_system.entity.Student;
import net_javaguides.food_order_system.mapper.StudentMapper;
import net_javaguides.food_order_system.repository.StudentRepository;
import net_javaguides.food_order_system.service.StudentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor

public class StudentServiceImpl implements StudentService {

    private StudentRepository studentRepository;

    @Override
    public StudentDto createStudent(StudentDto studentDto) {

        Student student = StudentMapper.mapToStudent(studentDto);

        Student savedStudent = studentRepository.save(student);

        return StudentMapper.mapToStudentDto(savedStudent);

    }



    @Override
    public StudentDto getStudentById(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id: " + id));

        return StudentMapper.mapToStudentDto(student);

    }

    @Override
    public List<StudentDto> getAllStudents() {
        List<Student> students = studentRepository.findAll();

        return students.stream()
                .map(StudentMapper::mapToStudentDto)
                .collect(Collectors.toList());

    }



    @Override
    public StudentDto updateStudent(Long id, StudentDto updatedStudent) {


        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id: " + id));

        student.setStudentNumber(updatedStudent.getStudentNumber());
        student.setFirstName(updatedStudent.getFirstName());
        student.setLastName(updatedStudent.getLastName());
        student.setEmail(updatedStudent.getEmail());
        student.setContact(updatedStudent.getContact());
        student.setPassword(updatedStudent.getPassword());

        Student updatedStudentobj = studentRepository.save(student);

        return StudentMapper.mapToStudentDto(updatedStudentobj);

    }

    @Override
    public void deleteStudent(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id: " + id));

        studentRepository.deleteById(id);

    }
}
