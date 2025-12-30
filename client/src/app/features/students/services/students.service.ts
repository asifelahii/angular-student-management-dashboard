import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';

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

  private studentsCache: Student[] | null = null;

  constructor(private http: HttpClient) {}

  // getStudents(n: number): Observable<Student[]> {
  //   return this.http.get<any[]>(this.USERS_API_URL).pipe(
  //     map((users) =>
  //       users.slice(0, n).map(
  //         (user) =>
  //           ({
  //             id: user.id,
  //             name: user.name,
  //             email: user.email,
  //             phone: user.phone,
  //             department: this.departments[user.id % this.departments.length],
  //             semester: (user.id % 12) + 1,
  //             status: this.studentStatus[user.id % this.studentStatus.length] as
  //               | 'Active'
  //               | 'Inactive'
  //               | 'Graduated',
  //             avatarUrl: `${this.AVATAR_API_URL}/${user.id}.jpg`,
  //           } as Student)
  //       )
  //     )
  //   );
  // }

  // getStudentById(id: number): Observable<Student | null> {
  //   // Use same source as list so data is consistent
  //   return this.getStudents(50).pipe(map((students) => students.find((s) => s.id === id) ?? null));
  // }

  getStudents(n: number): Observable<Student[]> {
    // ✅ 1) If already loaded once, return from cache (no HTTP)
    if (this.studentsCache) {
      return of(this.studentsCache.slice(0, n));
    }

    // ✅ 2) Otherwise fetch and save into cache
    return this.http.get<any[]>(this.USERS_API_URL).pipe(
      map((users) =>
        users.map(
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
      ),

      // ✅ save full mapped list once
      tap((students) => (this.studentsCache = students)),

      // ✅ return only requested amount
      map((students) => students.slice(0, n))
    );
  }

  getStudentById(id: number): Observable<Student | null> {
    // ✅ 1) Try cache first (fast, no HTTP)
    if (this.studentsCache) {
      return of(this.studentsCache.find((s) => s.id === id) ?? null);
    }

    // ✅ 2) If cache empty, fetch once, then find
    return this.getStudents(50).pipe(map((students) => students.find((s) => s.id === id) ?? null));
  }

  // Optional helper (useful later for logout / refresh)
  clearCache() {
    this.studentsCache = null;
  }
}
