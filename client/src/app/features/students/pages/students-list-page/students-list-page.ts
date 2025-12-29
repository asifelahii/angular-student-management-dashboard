import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Student } from '../../models/student/student.models';
import { StudentsService } from '../../services/students.service';
import { StudentCard } from '../../../../shared/components/student-card/student-card';
import {
  GlassSelect,
  GlassSelectOption,
} from '../../../../shared/components/glass-select/glass-select';

@Component({
  selector: 'app-students-list-page',
  imports: [RouterModule, StudentCard, FormsModule, GlassSelect],
  templateUrl: './students-list-page.html',
  styleUrl: './students-list-page.scss',
})
export class StudentsListPage implements OnInit {
  students: Student[] = [];

  query: string = '';
  sortBy: 'name' | 'department' | 'semester' | 'status' = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  sortOptions: GlassSelectOption<'name' | 'department' | 'semester' | 'status'>[] = [
    { label: 'Name', value: 'name' },
    { label: 'Department', value: 'department' },
    { label: 'Semester', value: 'semester' },
    { label: 'Status', value: 'status' },
  ];

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.studentsService.getStudents(20).subscribe((students) => {
      this.students = students;
    });
  }

  get visibleStudents() {
    const q = this.query.trim().toLowerCase();

    // 1) Filter (name OR email), case-insensitive
    const filtered = !q
      ? this.students
      : this.students.filter((s) => {
          const name = (s.name ?? '').toLowerCase();
          const email = (s.email ?? '').toLowerCase();
          return name.includes(q) || email.includes(q);
        });

    // 2) Sort (by selected key + direction)
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const key = this.sortBy;

    return [...filtered].sort((a, b) => {
      const av = String((a as any)[key] ?? '').toLowerCase();
      const bv = String((b as any)[key] ?? '').toLowerCase();
      return av.localeCompare(bv) * dir;
    });
  }

  onAddStudent() {
    alert('Add Student clicked!');
  }
}
