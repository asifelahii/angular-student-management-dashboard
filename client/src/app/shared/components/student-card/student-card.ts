import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Student } from '../../../features/students/models/student/student.models';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-card.html',
  styleUrls: ['./student-card.scss'],
})
export class StudentCard {
  @Input({ required: true }) student!: Student;

  // If avatar fails, we hide the image and show initials
  avatarFailed = false;

  onAvatarError() {
    this.avatarFailed = true;
  }

  get initials(): string {
    const parts = (this.student?.name ?? '').trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase();
  }
}
