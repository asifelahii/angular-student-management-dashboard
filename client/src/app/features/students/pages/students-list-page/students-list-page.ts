import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

import { Student } from '../../models/student/student.models';
import { StudentsService } from '../../services/students.service';
import { StudentCard } from '../../../../shared/components/student-card/student-card';
import {
  GlassSelect,
  GlassSelectOption,
} from '../../../../shared/components/glass-select/glass-select';

type SortKey = 'name' | 'department' | 'semester' | 'status';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-students-list-page',
  standalone: true,
  imports: [RouterModule, StudentCard, FormsModule, GlassSelect, AsyncPipe],
  templateUrl: './students-list-page.html',
  styleUrl: './students-list-page.scss',
})
export class StudentsListPage implements OnInit {
  // UI state
  state$;

  // raw list from state
  students: Student[] = [];

  // search + sort
  query = '';
  sortBy: SortKey = 'name';
  sortDir: SortDir = 'asc';

  sortOptions: GlassSelectOption<SortKey>[] = [
    { label: 'Name', value: 'name' },
    { label: 'Department', value: 'department' },
    { label: 'Semester', value: 'semester' },
    { label: 'Status', value: 'status' },
  ];

  private readonly limit = 50;

  constructor(
    private studentsService: StudentsService,
    private router: Router,
  ) {
    this.state$ = this.studentsService.studentsState$;
  }

  ngOnInit(): void {
    // load with loading state + delay
    this.studentsService.loadStudents(this.limit);

    // keep local students in sync (so your computed visibleStudents works)
    this.state$.subscribe((s) => {
      this.students = s.data;
    });
  }

  // computed list (search + sort together)
  get visibleStudents() {
    const q = this.query.trim().toLowerCase();

    const filtered = !q
      ? this.students
      : this.students.filter((s) => {
          const name = (s.name ?? '').toLowerCase();
          const email = (s.email ?? '').toLowerCase();
          return name.includes(q) || email.includes(q);
        });

    const dir = this.sortDir === 'asc' ? 1 : -1;
    const key = this.sortBy;

    return [...filtered].sort((a, b) => {
      // semester is numeric - sort numerically
      if (key === 'semester') {
        const av = Number((a as any)[key] ?? 0);
        const bv = Number((b as any)[key] ?? 0);
        return (av - bv) * dir;
      }

      const av = String((a as any)[key] ?? '').toLowerCase();
      const bv = String((b as any)[key] ?? '').toLowerCase();
      return av.localeCompare(bv) * dir;
    });
  }

  toggleDir() {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  }

  onAddStudent() {
    this.router.navigate(['/students/add']);
  }

  retry() {
    this.studentsService.loadStudents(this.limit);
  }

  // Only for acceptance criteria (simulate error at least once)
  simulateErrorOnce() {
    this.studentsService.failNextLoad();
    this.studentsService.loadStudents(this.limit);
  }

  setSortDir(dir: 'asc' | 'desc') {
    this.sortDir = dir;
  }
}
