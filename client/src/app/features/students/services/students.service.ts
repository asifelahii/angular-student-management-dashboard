import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Student } from '../models/student/student.models';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  departments = [
    'Computer Science',
    'Electrical',
    'Mechanical',
    'Civil',
    'Business',
    'English',
    'Arabic',
    'Bangla',
  ];

  studentStatus = ['Active', 'Inactive', 'Graduated'];

  private USERS_API_URL = 'https://jsonplaceholder.typicode.com/users';

  private AVATAR_API_URL = 'https://randomuser.me/portraits/men';

  constructor(private http: HttpClient) {}

  getStudents(n: number): Observable<Student[]> {
    return this.http.get<any[]>(this.USERS_API_URL).pipe(
      map((users) =>
        users.slice(0, n).map(
          (user) =>
            ({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              department: this.departments[user.id % this.departments.length],
              semester: (user.id % 12) + 1,
              status: this.studentStatus[user.id % this.studentStatus.length] as
                | 'Active'
                | 'Inactive'
                | 'Graduated',
              avatarUrl: `${this.AVATAR_API_URL}/${user.id}.jpg`,
            } as Student)
        )
      )
    );
  }
}
