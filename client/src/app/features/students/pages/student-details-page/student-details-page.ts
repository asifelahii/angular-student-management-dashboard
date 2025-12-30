import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

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
  student: Student | null = null;

  constructor(private route: ActivatedRoute, private studentsService: StudentsService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    // Guard: invalid id
    if (!idParam || Number.isNaN(id)) {
      this.isLoading = false;
      this.student = null;
      return;
    }

    // this.isLoading = true;
    // this.studentsService.getStudentById(id).subscribe((s) => {
    //   this.student = s;
    //   this.isLoading = false;
    // });

     // this.studentsService
    //   .getStudentById(id)
    //   .pipe(
    //     catchError((err) => {
    //       console.error('Failed to load student', err);
    //       return of(null);
    //     })
    //   )
    //   .subscribe((s) => {
    //     this.student = s;
    //     this.isLoading = false;
    //   });

    this.isLoading = true;

    this.studentsService.getStudentById(id).subscribe({
      next: (s) => {
        this.student = s; // can be Student or null
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load student:', err);
        this.student = null;
        this.isLoading = false; // ✅ IMPORTANT: stop loading on error
      },
    });
  }
}
