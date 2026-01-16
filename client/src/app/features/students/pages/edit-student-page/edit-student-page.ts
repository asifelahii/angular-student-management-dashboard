import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';

import { StudentsService } from '../../services/students.service';
import { Student } from '../../models/student/student.models';
import {
  GlassSelect,
  GlassSelectOption,
} from '../../../../shared/components/glass-select/glass-select';

@Component({
  selector: 'app-edit-student-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GlassSelect],
  templateUrl: './edit-student-page.html',
  styleUrls: ['./edit-student-page.scss'],
})
export class EditStudentPage implements OnInit {
  submitted = false;
  isLoading = true;

  studentId: number | null = null;
  student: Student | null = null;

  // Optional avatar support (reuse from your Add page)
  avatarPreviewUrl: string | null = null;
  avatarError: string | null = null;

  departmentOptions: GlassSelectOption<string>[] = [];
  statusOptions: GlassSelectOption<Student['status']>[] = [];
  semesterOptions: GlassSelectOption<string>[] = [];
  form;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService
  ) {
    // Initialize options after services are injected
    this.departmentOptions = this.studentsService.departments.map((d) => ({
      label: d,
      value: d,
    }));

    this.statusOptions = (['Active', 'Inactive', 'Graduated'] as const).map((s) => ({
      label: s,
      value: s,
    }));

    const semesters = Array.from({ length: 12 }, (_, i) => i + 1);
    this.semesterOptions = semesters.map((n) => ({
      label: `Semester ${n}`,
      value: String(n),
    }));

    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      department: ['', [Validators.required]],
      semester: '1',
      status: 'Active' as Student['status'],
    });

    console.log('EditStudentPage loaded');
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
      this.isLoading = false;
      this.student = null;
      return;
    }

    this.studentId = id;
    this.isLoading = true;

    // Load student (from cache or fetch)
    this.studentsService.getStudentById(id).subscribe({
      next: (s) => {
        this.student = s;

        if (s) {
          // Prefill form
          this.form.patchValue({
            name: s.name ?? '',
            email: s.email,
            phone: s.phone,
            department: s.department,
            semester: String(s.semester),
            status: s.status,
          });

          // Prefill avatar preview (if any)
          this.avatarPreviewUrl = s.avatarUrl ?? null;
        }

        this.isLoading = false;
      },
      error: () => {
        this.student = null;
        this.isLoading = false;
      },
    });
  }

  onAvatarSelected(event: Event) {
    this.avatarError = null;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.avatarError = 'Please choose an image file.';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.avatarError = 'Image is too large. Max 2MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreviewUrl = String(reader.result);
    };
    reader.onerror = () => {
      this.avatarError = 'Failed to read the image.';
    };
    reader.readAsDataURL(file);
  }

  submit() {
    this.submitted = true;

    if (this.form.invalid || this.studentId == null) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const updated = this.studentsService.updateStudent(this.studentId, {
      name: v.name,
      email: v.email,
      phone: v.phone,
      department: v.department,
      semester: Number(v.semester),
      status: v.status,
      avatarUrl: this.avatarPreviewUrl ?? undefined,
    });

    if (!updated) {
      // Not found in service state
      this.student = null;
      return;
    }

    this.router.navigateByUrl(`/students/${this.studentId}`);
  }
}
