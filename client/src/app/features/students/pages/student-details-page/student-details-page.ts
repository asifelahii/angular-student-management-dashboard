import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-details-page',
  imports: [RouterLink],
  templateUrl: './student-details-page.html',
  styleUrl: './student-details-page.scss',
})
export class StudentDetailsPage {
  studentId: string | null;

  constructor(private route: ActivatedRoute) {
    this.studentId = this.route.snapshot.paramMap.get('id');
  }
}
