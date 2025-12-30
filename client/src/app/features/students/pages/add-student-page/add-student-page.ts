import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  GlassSelect,
  GlassSelectOption,
} from '../../../../shared/components/glass-select/glass-select';
import { StudentsService } from '../../services/students.service';
import type { Student } from '../../models/student/student.models';

@Component({
  selector: 'app-add-student-page',
  imports: [ReactiveFormsModule, RouterLink, GlassSelect],
  templateUrl: './add-student-page.html',
  styleUrl: './add-student-page.scss',
})
export class AddStudentPage {
  submitted = false;

  departmentOptions: GlassSelectOption<string>[] = [];
  statusOptions: GlassSelectOption<Student['status']>[] = [];
  semesterOptions: GlassSelectOption<string>[] = [];

  semesters = Array.from({ length: 12 }, (_, i) => i + 1);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentsService,
    private router: Router
  ) {
    // Initialize options after injection
    this.departmentOptions = this.studentService.departments.map((department) => ({
      label: department,
      value: department,
    }));

    this.statusOptions = (['Active', 'Inactive', 'Graduated'] as const).map((status) => ({
      label: status,
      value: status,
    })) as GlassSelectOption<Student['status']>[];

    this.semesterOptions = this.semesters.map((sem) => ({
      label: `Semester ${sem}`,
      value: String(sem),
    }));

    // Form initialization
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      department: ['', Validators.required],
      semester: ['1', [Validators.required]],
      status: 'Active' as Student['status'],
    });

    // Prime cache once so add uses same in-memory list
    this.studentService.getAllStudents().subscribe();
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.studentService.addStudent({
      name: value.name,
      email: value.email,
      phone: value.phone,
      department: value.department,
      semester: Number(value.semester),
      status: value.status,
      avatarUrl: '',
    });

    this.router.navigateByUrl('/students');
  }
}
