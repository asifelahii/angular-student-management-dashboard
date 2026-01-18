import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { StudentsService } from '../../services/students.service';
import { Student } from '../../models/student/student.models';

@Component({
  selector: 'app-student-details-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-details-page.html',
  styleUrls: ['./student-details-page.scss'],
})
export class StudentDetailsPage implements OnInit {
  isLoading = true;
  error: string | null = null;
  student: Student | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    // invalid id → treat as not found (no error)
    if (!idParam || Number.isNaN(id)) {
      this.isLoading = false;
      this.student = null;
      this.error = null;
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.studentsService
      .getStudentById(id)
      .pipe(
        catchError((err) => {
          console.error('Failed to load student:', err);
          this.error = 'Failed to load student. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe((s) => {
        this.student = s; // null = not found
      });
  }

  onDelete() {
    if (!this.student) return;

    const ok = confirm(`Delete ${this.student.name}? This can't be undone (for now).`);
    if (!ok) return;

    const deleted = this.studentsService.deleteStudent(this.student.id);

    if (deleted) {
      this.router.navigateByUrl('/students');
    } else {
      this.error = 'Student could not be deleted. Please try again.';
    }
  }
}
