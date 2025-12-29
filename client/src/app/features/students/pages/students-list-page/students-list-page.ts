import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Student } from '../../models/student/student.models';
import { StudentsService } from '../../services/students.service';
import { StudentCard } from '../../../../shared/components/student-card/student-card';

@Component({
  selector: 'app-students-list-page',
  imports: [RouterModule, StudentCard],
  templateUrl: './students-list-page.html',
  styleUrl: './students-list-page.scss',
})
export class StudentsListPage implements OnInit {
  students: Student[] = [];

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.studentsService.getStudents(20).subscribe((students) => {
      this.students = students;
    });
  }

  onAddStudent() {
    alert('Add Student clicked!');
  }
}
